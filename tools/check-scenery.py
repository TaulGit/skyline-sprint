import bpy,bmesh,json,os,sys
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'assets/blender/skyline-environment.blend'))
track=json.load(open(os.path.join(ROOT,'public/assets/track.json'),encoding='utf-8'))
vertices=[];faces=[];owners=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH' or o.name.startswith('Road_Render'):continue
 o.data.calc_loop_triangles();base=len(vertices);vertices.extend(o.matrix_world@p.co for p in o.data.vertices)
 for tri in o.data.loop_triangles:faces.append(tuple(base+i for i in tri.vertices));owners.append(o.name)
tree=BVHTree.FromPolygons(vertices,faces,all_triangles=True);hits=[];probes=0
def v(a):return Vector((a[0],-a[2],a[1]))
for i,s in enumerate(track['samples']):
 if not s['road']:continue
 for lateral in [-4.3,-2.15,0,2.15,4.3]:
  origin=v(s['p'])+v(s['r'])*lateral+v(s['u'])*.15;probes+=1
  point,normal,face,distance=tree.ray_cast(origin,v(s['u']),3.5)
  if point is not None:hits.append({'sample':i,'laneOffset':lateral,'object':owners[face],'height':distance+.15})
report={'trackHash':track['hash'],'probes':probes,'clearanceMeters':3.65,'hits':hits}
json.dump(report,open(os.path.join(ROOT,'evidence/scenery-clearance.json'),'w'),indent=2)
print(json.dumps({'probes':probes,'hits':len(hits),'examples':hits[:12]}),flush=True);sys.stdout.flush();sys.stderr.flush();os._exit(1 if hits else 0)
