import urllib.request
import json

data = json.dumps({
    'name': 'John',
    'class': '10A',
    'roll': 'R123',
    'marks': 95.5
}).encode('utf-8')

req = urllib.request.Request(
    'http://localhost:5001/students',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    response = urllib.request.urlopen(req)
    print(response.status, response.read().decode())
except urllib.error.HTTPError as e:
    print(e.code, e.read().decode())