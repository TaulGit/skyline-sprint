import bpy, bmesh, json, math, os, sys
from mathutils import Vector, Matrix
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
selection=json.load(open(os.path.join(ROOT,'assets/source/selection.json'),encoding='utf-8'))
os.makedirs(os.path.join(ROOT,'assets/blender/exports'),exist_ok=True)
def clear():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def load(source):
 bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'assets/source/tripo-out',source,'model.glb'))
 objs=[o for o in bpy.context.scene.objects if o.type=='MESH']
 bpy.ops.object.select_all(action='DESELECT')
 for o in objs:o.select_set(True)
 bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();o=bpy.context.object;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);return o
def normalize(o,size,car=False):
 points=[o.matrix_world@Vector(c) for c in o.bound_box];lo=Vector([min(v[i] for v in points) for i in range(3)]);hi=Vector([max(v[i] for v in points) for i in range(3)]);factor=size/max(hi-lo)
 center=(lo+hi)/2
 for vert in o.data.vertices:
  p=(vert.co-center)*factor
  if car:p=Matrix.Rotation(-math.pi/2,4,'Z')@p;p.z+=(hi.z-lo.z)*factor/2-.65
  else:p.z+=(hi.z-lo.z)*factor/2
  vert.co=p
 o.data.update()
def export(name):
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets/blender',name+'.blend'))
 bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'assets/blender/exports',name+'.glb'),export_format='GLB',export_cameras=False,export_lights=False)
clear();o=load(selection['car']);normalize(o,3.6,True);o.name='Car_Body'
# Source car is +X forward. Bake it to Blender -Y / glTF +Z.
# Remove wheel-region faces, then reconstruct wheels with clean pivots.
bm=bmesh.new();bm.from_mesh(o.data)
doomed=[f for f in bm.faces if abs(f.calc_center_median().x)>.57 and f.calc_center_median().z<.22 and abs(abs(f.calc_center_median().y)-1.10)<.61]
bmesh.ops.delete(bm,geom=doomed,context='FACES');bm.to_mesh(o.data);bm.free()
rubber=bpy.data.materials.new('Tire_rubber');rubber.diffuse_color=(.025,.035,.05,1)
rim=bpy.data.materials.new('Wheel_alloy');rim.diffuse_color=(.24,.33,.4,1)
for label,x,y in [('FL',-.85,-1.1),('FR',.85,-1.1),('RL',-.85,1.1),('RR',.85,1.1)]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.34,depth=.27,location=(x,y,-.31),rotation=(0,math.pi/2,0));wheel=bpy.context.object;wheel.name='Wheel_'+label;wheel.data.materials.append(rubber);bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.23,depth=.28,location=(x,y,-.31),rotation=(0,math.pi/2,0));hub=bpy.context.object;hub.data.materials.append(rim);bpy.ops.object.select_all(action='DESELECT');wheel.select_set(True);hub.select_set(True);bpy.context.view_layer.objects.active=wheel;bpy.ops.object.join()
export('car')
for item in selection['decorations']:
 clear();o=load(item['source']);normalize(o,1);o.name=item['name'];export(item['name'])
print('BLENDER_ASSETS_COMPLETE',flush=True)
sys.stdout.flush();sys.stderr.flush();os._exit(0)
