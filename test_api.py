import urllib.request
import json
import ssl

data = json.dumps({
    'name': 'John',
    'class': '10A',
    'roll': 'R123',
    'marks': 95.5
}).encode('utf-8')

req = urllib.request.Request(
    'https://localhost:5001/students',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

context = ssl._create_unverified_context()

try:
    response = urllib.request.urlopen(req, context=context)
    print(response.status, response.read().decode())
except urllib.error.HTTPError as e:
    print(e.code, e.read().decode())