import {afterEach,expect,it,vi} from 'vitest';
import {getLanguage,setLanguage,t} from '../src/i18n';
import {Platform} from '../src/platform/platform';
afterEach(()=>{setLanguage('zh');vi.unstubAllGlobals()});
it('switches static and dynamic race messages in both directions',()=>{
 setLanguage('en');expect(t('云端极速')).toBe('Skyline Sprint');expect(t('2/6 · 下一门 CP3')).toBe('2/6 · Next CP3');expect(t('漏过 CP 2 · 练习完赛')).toBe('Missed CP 2 · Practice finished');expect(t('我的成绩 00:42.123 · 第 5 名')).toBe('My time 00:42.123 · Rank 5');
 setLanguage('zh');expect(t('云端极速')).toBe('云端极速');
});
it('persists language and keeps compatibility with old settings',()=>{
 const save=vi.fn();vi.stubGlobal('localStorage',{setItem:save});setLanguage('en');expect(save).toHaveBeenCalledWith('skyline:language','en');expect(getLanguage()).toBe('en');
 const p=new Platform('t','p',()=>{});expect(p.cleanSettings({}).language).toBe('en');expect(p.cleanSettings({language:'zh'}).language).toBe('zh');expect(p.cleanSettings({language:'en',car:'rally-buggy'}).car).toBe('rally-buggy');
});
