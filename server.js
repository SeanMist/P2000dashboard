import time
import urllib.request
import json
import re

# Dit adres stuurt de data naar jouw online website op Render
RENDER_URL = "https://p2000dashboard.onrender.com/api/update"

def haal_en_stuur():
    try:
        # Haal lokaal (zonder blokkades) de echte feed op
        url = "https://www.alarmeringen.nl/feed/safety-region/groningen.rss"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        
        with urllib.request.urlopen(req, timeout=10) as resp:
            xml_data = resp.read().decode('utf-8')
        
        items = []
        item_matches = re.findall(r'<item>(.*?)</item>', xml_data, re.DOTALL)
        
        for item_content in item_matches[:30]:
            def get_tag(tag):
                m = re.search(rf'<{tag}>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{tag}>', item_content, re.DOTALL)
                return m.group(1).strip() if m else ''
            
            title = get_tag('title')
            description = get_tag('description')
            pub_date = get_tag('pubDate')
            
            raw_t = time.time()
            formatted_t = 'Net binnen'
            if pub_date:
                try:
                    parsed_t = time.strptime(pub_date[5:25], "%d %b %Y %H:%M:%S")
                    raw_t = time.mktime(parsed_t)
                    formatted_t = time.strftime("%H:%M:%S", parsed_t)
                except:
                    pass

            items.append({
                'time': formatted_t,
                'rawTime': raw_t,
                'city': title or 'Groningen',
                'text': description or title or 'Geen omschrijving'
            })
        
        # Stuur de echte meldingen door naar jouw website op Render
        data_bytes = json.dumps(items).encode('utf-8')
        post_req = urllib.request.Request(
            RENDER_URL, 
            data=data_bytes, 
            headers={'Content-Type': 'application/json'}, 
            method='POST'
        )
        
        with urllib.request.urlopen(post_req, timeout=10) as post_resp:
            print(f"[{time.strftime('%H:%M:%S')}] {len(items)} echte meldingen doorgestuurd naar Render!")

    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Fout bij verzenden: {e}")

if __name__ == '__main__':
    print("P2000 Pusher is gestart...")
    while True:
        haal_en_stuur()
        time.sleep(15) # Elke 15 seconden controleren en doorsturen
