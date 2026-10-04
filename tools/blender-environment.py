"""Author the scenery in Blender; road physics remains the baked track's contract."""
import bpy, math, os, json, random, sys
from mathutils import Vector, Matrix
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
track=json.load(open(os.path.join(ROOT,'public/assets/track.json'),encoding='utf-8'))
selection=json.load(open(os.path.join(ROOT,'assets/source/selection.json'),encoding='utf-8'))
rng=random.Random(8537)
bpy.ops.wm.read_factory_settings(use_empty=True)
def v(a):return Vector((a[0],-a[2],a[1]))
def material(name,color,metal=0,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.75
 if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
 return m
rock=material('AI basalt / UV cliff',(.28,.33,.42));node=rock.node_tree.nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(os.path.join(ROOT,'assets/source/textures/basalt-albedo.png'));rock.node_tree.links.new(node.outputs['Color'],rock.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
grass=material('Muted jade island tops',(.19,.34,.30));slate=material('Structural graphite',(.065,.115,.17),.35);metal=material('Brushed alloy',(.38,.5,.54),.55)
cyan=material('Cyan navigation',(.035,.72,.8),.3,.5);orange=material('Amber turn guides',(1,.36,.08),.1,.25);white=material('Porcelain paint',(.78,.85,.85));cloud=material('Cloud banks',(.75,.86,.93))
authored=[]
def mesh(name,verts,faces,mat):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);data.materials.append(mat);authored.append(obj);return obj
def box(name,p,size,mat,rotation=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=bpy.context.object;o.name=name;o.scale=size;o.data.materials.append(mat)
 if rotation:o.rotation_mode='QUATERNION';o.rotation_quaternion=rotation
 authored.append(o);return o
def beam(name,a,b,width,mat):
 o=box(name,(a+b)*.5,(width,width,(b-a).length),mat);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
def island(name,p,rx,ry,depth):
 count=14;angles=[i*2*math.pi/count for i in range(count)];radii=[rng.uniform(.82,1.1) for _ in angles];verts=[]
 for scale,z in [(1,0),(1.04,-depth*.18),(.7,-depth*.58),(.18,-depth)]:
  for a,r in zip(angles,radii):verts.append(p+Vector((math.cos(a)*rx*r*scale,math.sin(a)*ry*r*scale,z+rng.uniform(-.5,.5))))
 faces=[]
 for band in range(3):
  for i in range(count):j=(i+1)%count;faces.extend([(band*count+i,band*count+j,(band+1)*count+i),(band*count+j,(band+1)*count+j,(band+1)*count+i)])
 faces.append(tuple(reversed(range(3*count,4*count))));o=mesh(name+'_Cliff',verts,faces,rock)
 uv=o.data.uv_layers.new(name='CliffMeters')
 for poly in o.data.polygons:
  normal=poly.normal
  for li in poly.loop_indices:
   co=o.data.vertices[o.data.loops[li].vertex_index].co-p
   uv.data[li].uv=((co.x if abs(normal.y)>abs(normal.x) else co.y)/18,co.z/18)
 mesh(name+'_Crown',verts[:count],[tuple(range(count))],grass)

# Platforms under the authored Tripo landmarks; the top is aligned with each pivot.
for item in selection['decorations']:
 if item['name'] in ['beacon','floating-rock','crystal-island']:continue
 for index in item['samples']:
  s=track['samples'][index];p=v(s['p'])+v(s['r'])*item['offset'];p.z-=.4
  radius=max(3,item['size']*.47)
  island(item['name']+'_Base_'+str(index),p,radius,radius*.85,max(7,radius*1.7))

# Broad land masses ground the otherwise weightless road and establish three districts.
for index,side,rx,ry,depth in [(18,0,18,27,29),(140,-18,19,25,35),(295,0,19,22,35),(440,16,22,19,33),(570,-18,24,24,42),(680,0,21,24,38),(880,0,25,27,40)]:
 s=track['samples'][index];p=v(s['p'])+v(s['r'])*side;p.z-=4.5
 # No island crown may intersect any nearby road, including a different segment.
 nearby=[q['p'][1] for q in track['samples'] if abs(q['p'][0]-p.x)<rx+6 and abs(-q['p'][2]-p.y)<ry+6]
 if nearby:p.z=min(p.z,min(nearby)-3)
 island('District_'+str(index),p,rx,ry,depth)

# Visible deck depth, cross ties and diagonal truss work follow the same road frames.
for index in range(0,len(track['samples'])-6,6):
 a=track['samples'][index];b=track['samples'][index+6]
 if not all(q['road'] for q in track['samples'][index:index+7]):continue
 p=v(a['p']);q=v(b['p']);right=v(a['r']);up=v(a['u']);rotation=Matrix((right,v(a['t']),up)).transposed().to_quaternion()
 for side in [-1,1]:
  beam('Deck_spine',p+right*side*4.5-up*.65,q+v(b['r'])*side*4.5-v(b['u'])*.65,.34,slate)
 if index%18==0:
  box('Cross_tie',p-up*.7,(9.5,.3,.36),metal,rotation)
  if a['u'][1]>.75:
   beam('Pylon',p-up*.8,p-Vector((0,0,8)),.65,slate)
   for side in [-1,1]:beam('Brace',p+right*side*4-up*.8,p-Vector((0,0,5)),.24,metal)
 # Paired road-edge lamps and panel seams communicate scale at driving speed.
 if index%12==0:
  for side in [-1,1]:box('Edge_light',p+right*side*4.72+up*.075,(.12,1.25,.035),cyan,rotation)
 if index%24==0:box('Expansion_joint',p+up*.012,(9.2,.035,.012),slate,rotation)

# Large forward-pointing chevrons lie on the road; zero gameplay collision.
for index in [35,65,130,170,205,270,305,350,385,465,505,550,590,630,662,820,850]:
 s=track['samples'][index]
 if not s['road']:continue
 p=v(s['p'])+v(s['u'])*.07;r=v(s['r']);t=v(s['t'])
 vertices=[p+r*x+t*y for x,y in [(-1.1,-.65),(0,.35),(1.1,-.65),(1.1,-1.18),(0,-.18),(-1.1,-1.18)]]
 mesh('Route_chevron',vertices,[(0,1,4,5),(1,2,3,4)],cyan)

# The ring is framed by a separate architectural halo, clear of the drivable ribbon.
loop=[s for s in track['samples'] if s['name']=='竖直能源环'];center=sum((v(s['p']) for s in loop),Vector())/len(loop)
normal=v(loop[0]['r']);axis=v(loop[0]['t']);up=Vector((0,0,1))
for side in [-1,1]:
 points=[center+normal*side*9+axis*math.cos(i*math.tau/64)*25+up*math.sin(i*math.tau/64)*25 for i in range(65)]
 for i in range(64):beam('Energy_halo',points[i],points[i+1],.32,cyan if i%8<5 else slate)

# Far silhouettes replace the near-road pile of unrelated boulders.
for i in range(20):
 s=track['samples'][(i*47)%len(track['samples'])];p=v(s['p'])+v(s['r'])*(90+40*rng.random())*(-1 if i%2 else 1);p.z-=35+rng.random()*30
 island('Far_island_'+str(i),p,12+rng.random()*18,12+rng.random()*18,28+rng.random()*25)

# Merge by material for a small stable draw-call budget; retain a fully editable source.
os.makedirs(os.path.join(ROOT,'assets/blender/exports'),exist_ok=True)
bpy.ops.object.select_all(action='DESELECT')
for o in authored:o.select_set(True)
bpy.context.view_layer.objects.active=authored[0]
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'assets/blender/exports/environment.glb'),use_selection=True,export_format='GLB',export_cameras=False,export_lights=False)

# Source scene includes the Tripo models in exactly the runtime placements and road.
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'public/assets/track.glb'))
for item in selection['decorations']:
 bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'assets/blender/exports',item['name']+'.glb'))
 originals=list(bpy.context.selected_objects)
 for n,index in enumerate(item['samples']):
  s=track['samples'][index];p=v(s['p'])+v(s['r'])*item['offset']
  if item['name']=='floating-rock':p.z-=item['size']*.85
  for original in originals:
   o=original if n==0 else original.copy()
   if n:bpy.context.collection.objects.link(o)
   o.location=p;o.scale=(item['size'],)*3
world=bpy.data.worlds.new('Sky');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.37,.62,.84,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7;bpy.context.scene.world=world
bpy.ops.object.light_add(type='SUN');bpy.context.object.data.energy=2.6;bpy.context.object.rotation_euler=(.45,-.5,-.4)
bpy.ops.object.camera_add();cam=bpy.context.object;focus=v(track['samples'][710]['p']);cam.location=focus+Vector((100,160,90));cam.rotation_euler=(focus-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=32;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.render.resolution_x=1440;scene.render.resolution_y=900;scene.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets/blender/skyline-environment.blend'))
scene.render.filepath=os.path.join(ROOT,'assets/environment-overview.png');bpy.ops.render.render(write_still=True)
print('ENVIRONMENT_COMPLETE',flush=True);sys.stdout.flush();sys.stderr.flush();os._exit(0)
