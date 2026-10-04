import bpy, json, math, os
from mathutils import Vector, Quaternion
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
track=json.load(open(os.path.join(ROOT,'public/assets/track.json'),encoding='utf-8'))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def v(a): return Vector((a[0],-a[2],a[1]))
def mat(name,color,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.45;return m
roadmat=mat('Porcelain road',(.72,.81,.83));cyan=mat('Cyan guidance',(.05,.7,.78));orange=mat('Danger orange',(1,.34,.1));dark=mat('Slate support',(.045,.09,.15))
vertices=[];faces=[]
for i in range(len(track['samples'])-1):
 a,b=track['samples'][i:i+2]
 if not a['road'] or not b['road']:continue
 k=len(vertices)
 for s in [a,b]:
  for side in [-1,1]:vertices.append(v(s['p'])+v(s['r'])*side*s['width']/2)
 faces.extend([(k,k+2,k+1),(k+1,k+2,k+3)])
mesh=bpy.data.meshes.new('Baked road geometry');mesh.from_pydata(vertices,[],faces);mesh.update();road=bpy.data.objects.new('Road_Render',mesh);bpy.context.collection.objects.link(road);road.data.materials.append(roadmat)
collision=road.copy();collision.data=road.data.copy();collision.name='Road_Collision';bpy.context.collection.objects.link(collision);collision.hide_render=True;collision.hide_set(True)
def box(name,pos,scale,material):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material);return o
for i,s in enumerate(track['samples']):
 if not s['road']:continue
 p=v(s['p']);r=v(s['r']);u=v(s['u']);t=v(s['t'])
 from mathutils import Matrix
 rotation=Matrix((r,t,u)).transposed().to_quaternion()
 if i%6==0:
  o=box('Lane_marker',p+u*.025,(.14,2.7,.04),cyan);o.rotation_mode='QUATERNION';o.rotation_quaternion=rotation
 if i%24==0 and s['u'][1]>.9:box('Support',p-Vector((0,0,8)),(1,1,16),dark)
for i,g in enumerate(track['gates']):
 p=v(g['p']);r=v(g['r']);u=v(g['u']);t=v(g['t']);rotation=Matrix((r,t,u)).transposed().to_quaternion()
 for side in [-1,1]:
  o=box('Checkpoint_%d'%i,p+r*5.15*side+u*2.5,(.35,.5,5),dark);o.rotation_mode='QUATERNION';o.rotation_quaternion=rotation
 o=box('Checkpoint_light_%d'%i,p+u*5,(10.6,.5,.4),orange if i==6 else cyan);o.rotation_mode='QUATERNION';o.rotation_quaternion=rotation
for i in range(24):
 s=track['samples'][(i*37)%len(track['samples'])];p=v(s['p'])+v(s['r'])*(22 if i%2 else -28)-Vector((0,0,13));bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=10,location=p);o=bpy.context.object;o.name='Floating_rock';o.scale=(1,1,.65);o.data.materials.append(dark)
 bpy.ops.mesh.primitive_cone_add(vertices=5,radius1=2.4,depth=9,location=p+Vector((0,0,10)));bpy.context.object.data.materials.append(cyan)
bpy.ops.object.light_add(type='SUN',location=(0,0,200));bpy.context.object.data.energy=3;bpy.context.object.rotation_euler=(.4,-.5,-.5)
bpy.context.scene.world.color=(.24,.36,.48)
bpy.ops.object.camera_add();cam=bpy.context.object;focus=v(track['samples'][728]['p']);cam.location=focus+Vector((120,130,85));cam.rotation_euler=(focus-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='PERSP';cam.data.lens=34;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1600;scene.render.resolution_y=900;scene.render.resolution_percentage=100
os.makedirs(os.path.join(ROOT,'assets/blender'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets/blender/skyline-track.blend'))
bpy.ops.object.select_all(action='DESELECT');road.select_set(True);bpy.context.view_layer.objects.active=road
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/assets/track.glb'),use_selection=True,export_format='GLB')
scene.render.filepath=os.path.join(ROOT,'cover.png');bpy.ops.render.render(write_still=True)
