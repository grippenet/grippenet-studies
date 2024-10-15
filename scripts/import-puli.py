import json
import argparse
import sys
import os
import hashlib
import datetime
from collections import OrderedDict

def read_json(file):
    return json.load(open(file, 'r', encoding='UTF-8'), object_pairs_hook=OrderedDict)

def save_json(file, data):
    #encoder = json.JSONEncoder()
    output = json.dumps(data, sort_keys=False, indent=2, ensure_ascii=False)
    with open(file, 'w') as f:
        f.write(output)
        f.close()

config = read_json('src/puli/questionnaire.json')

output = OrderedDict()

def import_options(oo):
    options = []
    for key, label in oo.items():
        options.append({'key': key, "label": label})
    return options


def import_def(conf):
    if not isinstance(conf, dict):
        return conf
    else:
        o = {}
        scale = None
        for name in conf.keys():
            if name == "title" or name == "sub-title":
                o[name] = conf[name]  
                continue 
            if name == "options":
                o['options'] = import_options(conf[name])
                continue
            if isinstance(conf[name], dict) and "sub-title" in conf[name]:
                if 'options' not in o:
                    o['options'] = []
                o['options'].append({'key': name, "label": conf[name]["sub-title"]}) 
                if scale is None:
                    scale = import_options(conf[name]['options'])
                    o['scale'] = scale
                continue
            o[name] = import_def(conf[name])
        return o

for name, conf in config.items():
    if not isinstance(conf, dict):
        output[name] = conf
    else:
        output[name] = import_def(conf)

save_json('src/puli/data.json', output)