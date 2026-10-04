import bpy, os, json, math, sys
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'assets/blender/skyline-environment.blend'))
track=json.load(open(os.path.join(ROOT,'public/assets/track.json'),encoding='utf-8'))
def v(a):return Vector((a[0],-a[2],a[1]))
sample=track['samples'][675];p=v(sample['p']);t=v(sample['t']);r=v(sample['r']);u=Vector((0,0,1))
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'assets/blender/exports/car.glb'))
car_objects=list(bpy.context.selected_objects);bpy.ops.object.empty_add();root=bpy.context.object;root.name='Hero_Car'
for o in car_objects:o.parent=root
root.location=p+u*.7;root.rotation_euler.z=math.atan2(t.y,t.x)+math.pi/2
cam=bpy.context.scene.camera;focus=v(track['samples'][728]['p']);cam.location=focus+Vector((120,130,85));cam.rotation_euler=(focus-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=34
bpy.context.view_layer.update();root.parent=cam;root.location=(.32,-.28,-2.8);root.scale=(.25,.25,.25);root.rotation_euler=(math.radians(66),math.radians(-8),math.radians(-28))
world=bpy.context.scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.39,.62,.8,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7
for o in bpy.context.scene.objects:
 if o.type=='LIGHT' and o.data.type=='SUN':o.data.energy=2.5
def text(body,pos,size,font=None,color=(.02,.08,.14,1)):
 curve=bpy.data.curves.new('Cover typography','FONT');curve.body=body;curve.size=size;curve.extrude=0
 if font:curve.font=font
 obj=bpy.data.objects.new(body,curve);bpy.context.collection.objects.link(obj);obj.parent=cam;obj.location=pos
 material=bpy.data.materials.new('Text_'+body);material.use_nodes=True;nodes=material.node_tree.nodes;nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');em=nodes.new('ShaderNodeEmission');em.inputs['Color'].default_value=color;material.node_tree.links.new(em.outputs[0],output.inputs[0]);obj.data.materials.append(material)
font=bpy.data.fonts.load('C:/Windows/Fonts/msyhbd.ttc') if os.path.exists('C:/Windows/Fonts/msyhbd.ttc') else None
text('云端极速',(-.94,.32,-2),.19,font)
text('SKYLINE SPRINT',(-.94,.20,-2),.065)
text('CHASE YOUR GHOST.',(-.94,.11,-2),.035,color=(.025,.28,.35,1))
scene=bpy.context.scene;scene.cycles.samples=32;scene.render.filepath=os.path.join(ROOT,'cover-final.png');bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets/blender/cover.blend'));bpy.ops.render.render(write_still=True)
sys.stdout.flush();sys.stderr.flush();os._exit(0)
