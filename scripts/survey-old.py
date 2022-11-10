
import sys
import os
import glob
import json
from influenzanet.surveys.influenzanet.loader import survey_transform_to_11

study = sys.argv[1]

path = 'output/' + study + '/surveys'
print(path)
for f in glob.glob(path + "/*.json", recursive=True):
    if f.endswith('.v1.json'):
        continue
    survey = json.load(open(f, 'r', encoding='UTF-8'))

    old_survey = survey_transform_to_11(survey, study_key=study)

    fn, ext = os.path.splitext(f)
    with open(fn + '.v1.json', 'w') as o:
        o.write(json.dumps(old_survey, indent=4, ensure_ascii=False))