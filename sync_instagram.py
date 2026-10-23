"""Sync all accessible Instagram feed media to a static JSON gallery."""
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

TOKEN = os.environ['INSTAGRAM_ACCESS_TOKEN']
BASE = 'https://graph.instagram.com/v25.0/me/media'
FIELDS = 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption'
OUT = Path('instagram-feed.json')
IMAGE_DIR = Path('images/instagram')
IMAGE_DIR.mkdir(parents=True, exist_ok=True)



def request_json(url):
    request = urllib.request.Request(
        url,
        headers={'Authorization': f'Bearer {TOKEN}'}
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.load(response)

    except urllib.error.HTTPError as error:
        details = error.read().decode(
            'utf-8', errors='replace'
        )

        print("Instagram API 오류:")
        print(details)

        raise



def image_for(post, old):
    key = ''.join(c for c in str(post['id']) if c.isdigit())
    path = IMAGE_DIR / f'{key}.jpg'
    if path.exists() and path.stat().st_size:
        return path.as_posix()
    source = post.get('thumbnail_url') if post.get('media_type') == 'VIDEO' else post.get('media_url')
    if not source:
        return old.get('image') if old else None
    req = urllib.request.Request(source, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            kind = resp.headers.get('Content-Type', '')
            if not kind.startswith('image/'):
                raise ValueError('Not an image')
            data = resp.read(15 * 1024 * 1024 + 1)
            if len(data) > 15 * 1024 * 1024:
                raise ValueError('Image exceeds 15 MB')
        path.write_bytes(data)
        return path.as_posix()
    except (urllib.error.URLError, TimeoutError, ValueError, OSError):
        print(f'Skipping image download for media {key}')
        return old.get('image') if old else None


def main():
    previous = {}
    if OUT.exists():
        try:
            previous = {item['id']: item for item in json.loads(OUT.read_text(encoding='utf-8'))}
        except (ValueError, KeyError, TypeError):
            pass

    url = BASE + '?' + urllib.parse.urlencode({'fields': FIELDS, 'limit': 100})
    found = {}
    visited = set()
    # API pagination: fetch all available pages, capped to prevent infinite loops.
    for page in range(200):
        if not url or url in visited:
            break
        visited.add(url)
        payload = request_json(url)
        for post in payload.get('data', []):
            if post.get('id') and post.get('permalink'):
                found[post['id']] = post
        url = payload.get('paging', {}).get('next')
    else:
        raise RuntimeError('Pagination safety limit reached; refusing incomplete overwrite')

    if not found:
        raise RuntimeError('No posts fetched; previous gallery preserved')
    if url:
        raise RuntimeError('Pagination incomplete; previous gallery preserved')

    result = []
    for post in sorted(found.values(), key=lambda p: p.get('timestamp', ''), reverse=True):
        old = previous.get(post['id'])
        image = image_for(post, old)
        if not image:
            continue
        result.append({
            'id': post['id'],
            'image': image,
            'permalink': post['permalink'],
            'timestamp': post.get('timestamp', ''),
            'type': post.get('media_type', ''),
            'caption': post.get('caption', ''),
        })

    if not result:
        raise RuntimeError('No usable gallery items; previous gallery preserved')
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Gallery updated: {len(result)} posts')


if __name__ == '__main__':
    main()
