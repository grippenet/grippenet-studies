import json
import argparse
import sys
import os
import datetime

def read_json(file):
    return json.load(open(file, 'r', encoding='UTF-8'))

def save_json(file, data):
    output = json.dumps(data, sort_keys=False, indent=2, ensure_ascii=False)
    with open(file, 'w') as f:
        f.write(output)
        f.close()

def file_exits(file):
    return os.path.isfile(file)

def show_help():
    print("update-trans.py target_name")
    print("  trans.json: trans file to modify")
    print("  target_name: name in trans.json to use")

class Target:

    def __init__(self, file) -> None:
        self.file = file
        self.updated = []
        self.data = read_json(file)

    def has(self, name):
        return name in self.data
    
    def update(self, name, trans):
        t = self.data[name]
        if trans['en'] != t['en']:
            print("Reference text is not the same for '%s' : '%s' <=> '%s'" % (name, trans['en'], t['en'] ))
            return 
        text = ""
        if 'fr' in trans:
            text = trans['fr']
        is_todo = isinstance(text, str) and (text == "" or text.startswith('TODO'))
        if not is_todo:
            t['fr'] = trans['fr']
        self.updated.append(name)

    def save(self):
        save_json(self.file, self.data)
        
    def __repr__(self) -> str:
        return str(self.__dict__)

parser = argparse.ArgumentParser(prog = 'update translation',)

parser.add_argument('target_name')
parser.add_argument('-c', '--config', default="trans.json", help="configuration json file")
            
args = parser.parse_args()

print(args)

config = read_json(args.config)
target = args.target_name

if not target in config:
    print("Target '%s' not found in config" % (target))
    sys.exit(1)

conf = config.get(target)

target_files = conf['targets']
update_file = conf['update']

if file_exits(update_file):
    updates = read_json(update_file)
else:
    print("Update file %s doesnt exists, using an empty update" % update_file)
    updates = {}

meta_keys = ['__meta__', '__instructions__']

targets = []
for file in target_files:
    targets.append(Target(file))

for name, trans in updates.items():
    found = False
    if name in meta_keys:
        continue
    for target in targets:
        if target.has(name):
            #print("%s found in %s" % (name, target.file))
            found = True
            target.update(name, trans)
            break
    if not found:
        print("Unknown key '%s' in target" % (name))
        continue

for target in targets:
    print(" - %d in %s" % (len(target.updated), target.file))
    target.save()

## Recompute all trans files with all targets
## First target has priority
data = {
    '__meta__': {
        "built_at": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "target": args.target_name,
    },
    "__instructions__": [
        "Ne pas modifier la version anglaise des textes qui sert de référence (même si il y'a des coquilles)",
        "Attention aux guillements, si vous mettez des doubles guillemets dans le textes, ils doivent être précédés un anti-slash (\)",
    ]
}
for target in targets:
    for name, trans in target.data.items():
        if name in data:
            continue
        data[name] = trans
        # data[name]['_from_'] = target.file

dir = os.path.dirname(update_file)
new_dir = dir + '/new'
if not os.path.exists(  new_dir ):
    os.mkdir(new_dir)
print("New version of trans file in %s" % new_dir)
save_json(new_dir + '/' + os.path.basename(update_file), data)