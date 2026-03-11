( function () {
	class GLTFLoader extends THREE.Loader {
		constructor( manager ) {
			super( manager );
			this.dracoLoader = null;
			this.ktx2Loader = null;
			this.meshoptDecoder = null;
			this.pluginCallbacks = [];
			this.register( function ( parser ) {
				return new GLTFMaterialsClearcoatExtension( parser );
			} );
			this.register( function ( parser ) {
				return new GLTFTextureBasisUExtension( parser );
			} );
			this.register( function ( parser ) {
				return new GLTFTextureWebPExtension( parser );
			} );
			this.register( function ( parser ) {
				return new GLTFMaterialsTransmissionExtension( parser );
			} );
			this.register( function ( parser ) {
				return new GLTFLightsExtension( parser );
			} );
			this.register( function ( parser ) {
				return new GLTFMeshoptCompression( parser );
			} );
		}
		load( url, onLoad, onProgress, onError ) {
			const scope = this;
			let resourcePath;
			if ( this.resourcePath !== '' ) {
				resourcePath = this.resourcePath;
			} else if ( this.path !== '' ) {
				resourcePath = this.path;
			} else {
				resourcePath = THREE.LoaderUtils.extractUrlBase( url );
			}
			this.manager.itemStart( url );
			const _onError = function ( e ) {
				if ( onError ) {
					onError( e );
				} else {
					console.error( e );
				}
				scope.manager.itemError( url );
				scope.manager.itemEnd( url );
			};
			const loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );
			loader.setRequestHeader( this.requestHeader );
			loader.setWithCredentials( this.withCredentials );
			loader.load( url, function ( data ) {
				try {
					scope.parse( data, resourcePath, function ( gltf ) {
						onLoad( gltf );
						scope.manager.itemEnd( url );
					}, _onError );
				} catch ( e ) {
					_onError( e );
				}
			}, onProgress, _onError );
		}
		parse( data, path, onLoad, onError ) {
			let content;
			const extensions = {};
			const plugins = {};
			if ( typeof data === 'string' ) {
				content = data;
			} else {
				const magic = THREE.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );
				if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {
					try {
						extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );
					} catch ( error ) {
						if ( onError ) onError( error );
						return;
					}
					content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;
				} else {
					content = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );
				}
			}
			const json = JSON.parse( content );
			if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {
				if ( onError ) onError( new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.' ) );
				return;
			}
			const parser = new GLTFParser( json, {
				path: path || this.resourcePath || '',
				crossOrigin: this.crossOrigin,
				requestHeader: this.requestHeader,
				manager: this.manager,
				dracoLoader: this.dracoLoader,
				ktx2Loader: this.ktx2Loader,
				meshoptDecoder: this.meshoptDecoder
			} );
			parser.fileLoader.setRequestHeader( this.requestHeader );
			parser.parse( onLoad, onError );
		}
	}
	const EXTENSIONS = {
		KHR_BINARY_GLTF: 'KHR_binary_glTF'
	};
	const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
	class GLTFBinaryExtension {
		constructor( data ) {
			this.name = EXTENSIONS.KHR_BINARY_GLTF;
			this.content = null;
			this.body = null;
			const headerView = new DataView( data, 0, 12 );
			this.header = {
				magic: THREE.LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
				version: headerView.getUint32( 4, true ),
				length: headerView.getUint32( 8, true )
			};
			if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {
				throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );
			}
			const contentArray = new Uint8Array( data, 12, this.header.length - 12 );
			this.content = THREE.LoaderUtils.decodeText( contentArray );
			const byteOffset = 12;
			const byteLength = this.header.length - 12;
			this.body = data.slice( byteOffset, byteOffset + byteLength );
		}
	}
	class GLTFParser {
		constructor( json = {}, options = {} ) {
			this.json = json;
			this.extensions = {};
			this.cache = { get: () => {}, add: () => {}, remove: () => {}, removeAll: () => {} };
			this.options = options;
			this.fileLoader = new THREE.FileLoader( this.options.manager );
			this.fileLoader.setResponseType( 'arraybuffer' );
			this.textureLoader = new THREE.TextureLoader( this.options.manager );
		}
		parse( onLoad, onError ) {
			const parser = this;
			const json = this.json;
			Promise.all( [
				this.getDependencies( 'scene' )
			] ).then( function ( dependencies ) {
				const result = {
					scene: dependencies[ 0 ][ json.scene || 0 ],
					scenes: dependencies[ 0 ],
					asset: json.asset,
					parser: parser,
					userData: {}
				};
				onLoad( result );
			} ).catch( onError );
		}
		getDependencies( type ) {
			const parser = this;
			const json = this.json;
			const dependencies = [];
			if ( json[ type + 's' ] === undefined ) {
				return Promise.resolve( dependencies );
			}
			for ( let i = 0, il = json[ type + 's' ].length; i < il; i ++ ) {
				dependencies.push( this.getDependency( type, i ) );
			}
			return Promise.all( dependencies );
		}
		getDependency( type, index ) {
			const cacheKey = type + ':' + index;
			let dependency = this.cache[ cacheKey ];
			if ( ! dependency ) {
				switch ( type ) {
					case 'scene':
						dependency = this.loadScene( index );
						break;
					case 'node':
						dependency = this.loadNode( index );
						break;
					case 'mesh':
						dependency = this.loadMesh( index );
						break;
					case 'accessor':
						dependency = this.loadAccessor( index );
						break;
					case 'bufferView':
						dependency = this.loadBufferView( index );
						break;
					case 'buffer':
						dependency = this.loadBuffer( index );
						break;
					case 'material':
						dependency = this.loadMaterial( index );
						break;
					case 'texture':
						dependency = this.loadTexture( index );
						break;
					case 'image':
						dependency = this.loadImage( index );
						break;
					default:
						throw new Error( 'Unknown type: ' + type );
				}
				this.cache[ cacheKey ] = dependency;
			}
			return dependency;
		}
		loadScene( sceneIndex ) {
			const json = this.json;
			const sceneDef = json.scenes[ sceneIndex ];
			const scene = new THREE.Scene();
			if ( sceneDef.name ) scene.name = sceneDef.name;
			const nodeIds = sceneDef.nodes || [];
			for ( let i = 0, il = nodeIds.length; i < il; i ++ ) {
				this.getDependency( 'node', nodeIds[ i ] ).then( function ( node ) {
					scene.add( node );
				} );
			}
			return Promise.resolve( scene );
		}
		loadNode( nodeIndex ) {
			const json = this.json;
			const nodeDef = json.nodes[ nodeIndex ];
			const node = new THREE.Object3D();
			if ( nodeDef.name ) node.name = nodeDef.name;
			if ( nodeDef.translation ) node.position.fromArray( nodeDef.translation );
			if ( nodeDef.rotation ) node.quaternion.fromArray( nodeDef.rotation );
			if ( nodeDef.scale ) node.scale.fromArray( nodeDef.scale );
			if ( nodeDef.matrix ) node.matrix.fromArray( nodeDef.matrix );
			if ( nodeDef.mesh !== undefined ) {
				return this.getDependency( 'mesh', nodeDef.mesh ).then( function ( mesh ) {
					node.add( mesh );
					return node;
				} );
			}
			return Promise.resolve( node );
		}
		loadMesh( meshIndex ) {
			const json = this.json;
			const meshDef = json.meshes[ meshIndex ];
			const primitives = meshDef.primitives;
			const pending = [];
			for ( let i = 0, il = primitives.length; i < il; i ++ ) {
				pending.push( this.loadPrimitive( primitives[ i ] ) );
			}
			return Promise.all( pending ).then( function ( objects ) {
				const group = new THREE.Group();
				for ( let i = 0, il = objects.length; i < il; i ++ ) {
					group.add( objects[ i ] );
				}
				if ( meshDef.name ) group.name = meshDef.name;
				return group;
			} );
		}
		loadPrimitive( primitiveDef ) {
			const pending = [];
			const geometry = new THREE.BufferGeometry();
			if ( primitiveDef.attributes.POSITION !== undefined ) {
				pending.push( this.getDependency( 'accessor', primitiveDef.attributes.POSITION ).then( function ( accessor ) {
					geometry.setAttribute( 'position', accessor );
				} ) );
			}
			if ( primitiveDef.attributes.NORMAL !== undefined ) {
				pending.push( this.getDependency( 'accessor', primitiveDef.attributes.NORMAL ).then( function ( accessor ) {
					geometry.setAttribute( 'normal', accessor );
				} ) );
			}
			if ( primitiveDef.attributes.TEXCOORD_0 !== undefined ) {
				pending.push( this.getDependency( 'accessor', primitiveDef.attributes.TEXCOORD_0 ).then( function ( accessor ) {
					geometry.setAttribute( 'uv', accessor );
				} ) );
			}
			if ( primitiveDef.indices !== undefined ) {
				pending.push( this.getDependency( 'accessor', primitiveDef.indices ).then( function ( accessor ) {
					geometry.setIndex( accessor );
				} ) );
			}
			return Promise.all( pending ).then( () => {
				let material;
				if ( primitiveDef.material !== undefined ) {
					return this.getDependency( 'material', primitiveDef.material );
				} else {
					material = new THREE.MeshStandardMaterial();
					return Promise.resolve( material );
				}
			} ).then( material => {
				const mesh = new THREE.Mesh( geometry, material );
				return mesh;
			} );
		}
		loadAccessor( accessorIndex ) {
			const json = this.json;
			const accessorDef = json.accessors[ accessorIndex ];
			const componentType = accessorDef.componentType;
			const type = accessorDef.type;
			const count = accessorDef.count;
			const bufferViewIndex = accessorDef.bufferView;
			return this.getDependency( 'bufferView', bufferViewIndex ).then( bufferView => {
				const itemSize = {
					'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4,
					'MAT2': 4, 'MAT3': 9, 'MAT4': 16
				}[ type ];
				const TypedArray = {
					5120: Int8Array, 5121: Uint8Array,
					5122: Int16Array, 5123: Uint16Array,
					5125: Uint32Array, 5126: Float32Array
				}[ componentType ];
				const byteOffset = accessorDef.byteOffset || 0;
				const buffer = new TypedArray( bufferView, byteOffset, count * itemSize );
				const attribute = new THREE.BufferAttribute( buffer, itemSize );
				return attribute;
			} );
		}
		loadBufferView( bufferViewIndex ) {
			const json = this.json;
			const bufferViewDef = json.bufferViews[ bufferViewIndex ];
			return this.getDependency( 'buffer', bufferViewDef.buffer ).then( buffer => {
				const byteOffset = bufferViewDef.byteOffset || 0;
				const byteLength = bufferViewDef.byteLength;
				return buffer.slice( byteOffset, byteOffset + byteLength );
			} );
		}
		loadBuffer( bufferIndex ) {
			const json = this.json;
			const bufferDef = json.buffers[ bufferIndex ];
			const url = bufferDef.uri;
			return new Promise( ( resolve, reject ) => {
				if ( url.match( /^data:application\/octet-stream;base64,/ ) ) {
					const base64 = url.split( ',' )[ 1 ];
					const binary = atob( base64 );
					const array = new Uint8Array( binary.length );
					for ( let i = 0; i < binary.length; i ++ ) {
						array[ i ] = binary.charCodeAt( i );
					}
					resolve( array.buffer );
				} else {
					this.fileLoader.load( url, resolve, undefined, reject );
				}
			} );
		}
		loadMaterial( materialIndex ) {
			const json = this.json;
			const materialDef = json.materials[ materialIndex ];
			const material = new THREE.MeshStandardMaterial();
			if ( materialDef.name ) material.name = materialDef.name;
			if ( materialDef.pbrMetallicRoughness ) {
				const pbr = materialDef.pbrMetallicRoughness;
				if ( pbr.baseColorFactor ) {
					material.color.fromArray( pbr.baseColorFactor );
					material.opacity = pbr.baseColorFactor[ 3 ];
				}
				if ( pbr.baseColorTexture ) {
					this.getDependency( 'texture', pbr.baseColorTexture.index ).then( texture => {
						material.map = texture;
					} );
				}
				if ( pbr.metallicFactor !== undefined ) material.metalness = pbr.metallicFactor;
				if ( pbr.roughnessFactor !== undefined ) material.roughness = pbr.roughnessFactor;
			}
			return Promise.resolve( material );
		}
		loadTexture( textureIndex ) {
			const json = this.json;
			const textureDef = json.textures[ textureIndex ];
			const source = json.images[ textureDef.source ];
			const texture = new THREE.Texture();
			if ( source.uri ) {
				return new Promise( ( resolve ) => {
					this.textureLoader.load( source.uri, image => {
						texture.image = image;
						texture.needsUpdate = true;
						resolve( texture );
					} );
				} );
			}
			return Promise.resolve( texture );
		}
		loadImage( imageIndex ) {
			const json = this.json;
			const imageDef = json.images[ imageIndex ];
			const texture = new THREE.Texture();
			if ( imageDef.uri ) {
				texture.image = this.textureLoader.load( imageDef.uri );
			}
			return Promise.resolve( texture );
		}
	}
	THREE.GLTFLoader = GLTFLoader;
} )();