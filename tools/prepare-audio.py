"""Convert selected licensed samples to browser-compatible PCM; no synthesis."""
from pathlib import Path
import soundfile as sf
import json
import numpy as np
sources={
 'engine':'engine-loop/engine-loop-1-normalized.wav','skid':'skid.ogg','impact':'impact.ogg',
 'click':'interface/Audio/click_003.ogg',
 'checkpoint':'interface/Audio/confirmation_001.ogg',
 'finish':'interface/Audio/confirmation_004.ogg',
}
report=[]
for name,path in sources.items():
 source=Path('assets/source/audio')/path;data,rate=sf.read(source)
 if name=='engine':
  # Overlap the recording's ends so the real engine loop has no seam click.
  overlap=int(rate*.12);fade=np.linspace(0,1,overlap,endpoint=False)[:,None]
  data=np.concatenate((data[overlap:-overlap],data[-overlap:]*(1-fade)+data[:overlap]*fade))
 destination=Path('public/assets/audio')/(name+'.wav');sf.write(destination,data,rate,subtype='PCM_16')
 report.append({'file':destination.as_posix(),'source':source.as_posix(),'duration':len(data)/rate,'sampleRate':rate})
for path in Path('public/assets/audio').glob('*.mp3'):
 info=sf.info(path);report.append({'file':path.as_posix(),'duration':info.duration,'sampleRate':info.samplerate})
Path('evidence/audio-files.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
