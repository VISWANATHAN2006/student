import urllib.request
import urllib.error

req = urllib.request.Request('http://127.0.0.1:8000/staff/pre-register', method='GET')
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.code, e.reason, e.read())
