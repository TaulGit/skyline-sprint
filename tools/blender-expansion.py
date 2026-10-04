"""Refine the six Tripo assets and build layered distant architecture in Blender."""
import bpy,bmesh,math,json,glob,os,sys,random
from mathutils import Vector,Matrix
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
def clear():bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(name,color,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.5;return m
def box(name,location,size,material,bevel=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=location);o=bpy.context.object;o.name=name;o.scale=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 if bevel:
  m=o.modifiers.new('Machined rounded edges','BEVEL');m.width=bevel;m.segments=3;bpy.ops.object.modifier_apply(modifier=m.name)
 return o
def load(name):
 source=glob.glob('assets/source/tripo-out/'+name+'-*/model.glb')[0];bpy.ops.import_scene.gltf(filepath=os.path.abspath(source));objects=[o for o in bpy.context.scene.objects if o.type=='MESH'];bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);return o
def normalize(o,size,angle=0,car=False):
 rotation=Matrix.Rotation(angle,4,'Z')
 for vert in o.data.vertices:vert.co=rotation@vert.co
 points=[v.co for v in o.data.vertices];lo=Vector([min(v[i] for v in points) for i in range(3)]);hi=Vector([max(v[i] for v in points) for i in range(3)]);center=(lo+hi)/2;factor=size/max(hi-lo)
 for vert in o.data.vertices:
  vert.co=(vert.co-center)*factor;vert.co.z+=(hi.z-lo.z)*factor/2-(.65 if car else 0)
  if car:vert.co.x*=1.88/((hi.x-lo.x)*factor)
 o.data.update();o.name='Car_Body' if car else 'Tripo_'+o.name
def export(name):
 bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('assets/blender/'+name+'.blend'))
 bpy.ops.export_scene.gltf(filepath=os.path.abspath('assets/blender/exports/'+name+'.glb'),export_format='GLB',export_cameras=False,export_lights=False)
def wheels():
 rubber=mat('Tread rubber',(.018,.025,.03));alloy=mat('Machined alloy',(.4,.47,.51),.8);dark=mat('Brake rotor',(.075,.10,.12),.6)
 for label,x,y in [('FL',-.85,-1.1),('FR',.85,-1.1),('RL',-.85,1.1),('RR',.85,1.1)]:
  parts=[]
  bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=8,location=(x,y,-.31),rotation=(0,math.pi/2,0),major_radius=.255,minor_radius=.085);tire=bpy.context.object;tire.data.materials.append(rubber);parts.append(tire)
  for radius,depth,material in [(.235,.19,alloy),(.19,.205,dark),(.065,.28,alloy)]:
   bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=radius,depth=depth,location=(x,y,-.31),rotation=(0,math.pi/2,0));o=bpy.context.object;o.data.materials.append(material);parts.append(o)
  for i in range(6):
   a=i*math.tau/6;o=box('Alloy spoke',(x,y+math.sin(a)*.12,-.31+math.cos(a)*.12),(.23,.032,.23),alloy,.008);o.rotation_euler.x=-a;parts.append(o)
  bpy.ops.object.select_all(action='DESELECT')
  for o in parts:o.select_set(True)
  bpy.context.view_layer.objects.active=tire;bpy.ops.object.join();tire.name='Wheel_'+label;bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
for name,angle in [('endurance-coupe',-math.pi/2),('rally-buggy',0)]:
 clear();o=load(name);normalize(o,3.65,angle,True)
 # Partition original wheel faces without discarding geometry or damaging the body silhouette.
 original=o.data.copy()
 def wheel_region(face):
  c=face.calc_center_median()
  if abs(c.x)<.57:return None
  for label,x,y in [('FL',-.85,-1.1),('FR',.85,-1.1),('RL',-.85,1.1),('RR',.85,1.1)]:
   if c.x*x>0 and (c.y-y)**2+(c.z+.31)**2<.46**2:return label
  return None
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.delete(bm,geom=[f for f in bm.faces if wheel_region(f)],context='FACES');bm.to_mesh(o.data);bm.free()
 for label,x,y in [('FL',-.85,-1.1),('FR',.85,-1.1),('RL',-.85,1.1),('RR',.85,1.1)]:
  data=original.copy();bm=bmesh.new();bm.from_mesh(data);bmesh.ops.delete(bm,geom=[f for f in bm.faces if wheel_region(f)!=label],context='FACES');bm.to_mesh(data);bm.free()
  pivot=Vector((x,y,-.31))
  for vertex in data.vertices:vertex.co-=pivot
  wheel=bpy.data.objects.new('Wheel_'+label,data);bpy.context.collection.objects.link(wheel);wheel.location=pivot
 export(name)
for name in ['warning-sign','safety-barrier','sky-airship','sky-citadel']:
 clear();o=load(name);normalize(o,1,-math.pi/2 if name=='warning-sign' else 0)
 if name=='warning-sign':
  amber=mat('Reflective amber',(1,.63,.08));ink=mat('Legible charcoal',(.018,.027,.035));box('Clean sign face',(0,-.095,.66),(.78,.025,.31),amber,.015)
  font=bpy.data.fonts.load('C:/Windows/Fonts/msyh.ttc');bpy.ops.object.text_add(location=(0,-.113,.66),rotation=(math.pi/2,0,0));text=bpy.context.object;text.name='请减速';text.data.body='请减速';text.data.font=font;text.data.align_x='CENTER';text.data.align_y='CENTER';text.data.size=.215;text.data.extrude=.001;text.data.materials.append(ink);bpy.ops.object.convert(target='MESH')
 if name=='sky-airship':
  brass=mat('Navigation brass',(.62,.37,.12),.65)
  for side in [-1,1]:box('Cabin rail',(side*.10,0,.035),(.01,.23,.012),brass,.004)
 if name=='sky-citadel':
  stone=mat('Balcony porcelain',(.72,.80,.79));glass=mat('Turquoise roof glass',(.055,.38,.43),.4)
  for level in range(3):
   for side in [-1,1]:box('Terrace cornice',(side*(.22-level*.04),0,.25+level*.11),(.12,.25,.016),stone,.004)
  for i in range(8):box('Harbor bollard',((i-3.5)*.055,-.30,.12),(.01,.01,.045),glass,.003)
 export(name)

# Editable distant district: tiered observatory, balcony rails, ribs, windows and a landing pad.
clear();stone=mat('District porcelain',(.66,.76,.77));slate=mat('District basalt',(.22,.31,.36));glass=mat('District glass',(.06,.36,.41),.45);copper=mat('District copper',(.67,.36,.16),.55)
for tier,radius,depth,z in [(0,12,5,-3),(1,10,3,0),(2,7,2,2.5)]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=radius,depth=depth,location=(0,0,z));bpy.context.object.data.materials.append(slate if tier==0 else stone)
for i in range(8):
 a=i*math.tau/8;x,y=7*math.cos(a),7*math.sin(a);h=9+(i%3)*3
 box('Beveled tower',(x,y,4+h/2),(2.3,2.3,h),stone,.18)
 for level in range(2,int(h),2):
  for side in [-1,1]:
   box('Recessed glass',(x+side*1.16,y,4+level),(.04,1.5,1.1),glass)
   box('Facade glass',(x,y+side*1.16,4+level),(1.5,.04,1.1),glass)
 box('Roof cornice',(x,y,4+h),(2.65,2.65,.3),copper,.08)
 for side in [-1,1]:box('Tower rib',(x+side*1.04,y-1.17,4+h/2),(.12,.12,h),stone,.025)
for radius,z in [(10.1,2),(7.1,4)]:
 for i in range(48):
  a=i*math.tau/48;box('Balcony stanchion',(radius*math.cos(a),radius*math.sin(a),z+.5),(.1,.1,1),copper,.02)
 bpy.ops.mesh.primitive_torus_add(major_segments=64,minor_segments=6,major_radius=radius,minor_radius=.075,location=(0,0,z+1));bpy.context.object.data.materials.append(copper)
box('Observatory',(0,0,13),(4.5,4.5,18),stone,.4)
bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=3,location=(0,0,22));bpy.context.object.data.materials.append(glass)
box('Antenna',(0,0,27),(.14,.14,6),copper,.035)
export('distant-observatory')
print('EXPANSION_BLENDER_COMPLETE',flush=True);sys.stdout.flush();sys.stderr.flush();os._exit(0)
