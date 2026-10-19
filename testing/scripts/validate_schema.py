import pathlib,json,sys
from jsonschema import Draft202012Validator
root=pathlib.Path(__file__).resolve().parents[2]
files=[('catalog.json','catalog'),('assets.json','assets')]+[(p.name,'chapter') for p in sorted((root/'dev/chapters').glob('chapter-*.json'))]
for name,schema in files:
 s=json.loads((root/f'dev/schema/{schema}.schema.json').read_text(encoding='utf-8'));Draft202012Validator.check_schema(s)
 errors=list(Draft202012Validator(s).iter_errors(json.loads((root/'dev/chapters'/name).read_text(encoding='utf-8'))))
 if errors:
  for e in errors: print(name,list(e.path),e.message)
  sys.exit(1)
 print('PASS',name)
