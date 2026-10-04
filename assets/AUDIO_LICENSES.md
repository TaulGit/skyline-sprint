# 音频来源

游戏只播放音频文件，不使用振荡器或程序噪声合成音效。

| 游戏文件 | 原素材 | 来源与许可 |
| --- | --- | --- |
| engine.wav / impact.wav | engine.ogg / impact.ogg | [Kenney Starter Kit Racing](https://github.com/KenneyNL/Starter-Kit-Racing)，CC0 |
| skid.wav | skid.ogg，Landeplage | 同上，CC0 |
| click.wav | click_003.ogg | [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds)，CC0 |
| checkpoint.wav | confirmation_001.ogg | 同上，CC0 |
| finish.wav | confirmation_004.ogg | 同上，CC0 |
| sky-flight-1.mp3 | Sky Flight.mp3 | 用户提供，保留原始文件；不属于上述 CC0 音效 |
| sky-flight-2.mp3 | Sky Flight (1).mp3 | 用户提供，保留原始文件；不属于上述 CC0 音效 |

原音效与许可保留在 `assets/source/audio/`。`tools/prepare-audio.py` 仅将 OGG 转为 PCM16 WAV，需要 Python `soundfile`。播放时按车速调整发动机采样的速率与音量。两首 BGM 按顺序循环，设置中的“下一首”可切换。
