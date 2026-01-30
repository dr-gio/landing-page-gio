import { useState, useEffect } from 'react';
import { Instagram, Globe, MessageCircle, PlayCircle, History, ExternalLink, Settings, X, Plus, Trash2, Edit2, Check, Camera, Lock, User, ShieldCheck } from 'lucide-react';
import { supabase } from './supabaseClient';
import './App.css';

const DEFAULT_LINKS = [
  { id: 1, title: "Sitio Web Oficial", url: "https://www.drgiovannifuentes.com", icon: "Globe", type: "primary" },
  { id: 2, title: "Instagram", url: "https://instagram.com/drgiovannifuentes", icon: "Instagram", type: "social" },
  { id: 3, title: "TikTok", url: "https://tiktok.com/@drgiovannifuentes", icon: "MessageCircle", type: "social" },
  { id: 4, title: "Agendar Cita / Valoración", url: "#", icon: "MessageCircle", type: "action" }
];

const DEFAULT_VIDEOS = {
  presentation: { title: "Presentación", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  history: { title: "Nuestra Historia", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
};

const DEFAULT_PROFILE = {
  name: "Dr. Giovanni Fuentes",
  title: "Cirujano Plástico | 440 Clinic",
  hashtag: "#LaBelleza440",
  image: "/dr_gio_profile.png"
};

const DEFAULT_FOOTER = {
  text: "440 Clinic. Todos los derechos reservados."
};

const ICON_MAP = {
  Globe: <Globe size={20} />,
  Instagram: <Instagram size={20} color="#E4405F" />,
  WhatsApp: <MessageCircle size={20} color="#25D366" />,
  TikTok: <PlayCircle size={20} color="#FFFFFF" />, // TikTok icon isn't in Lucide, using PlayCircle as a clean alternative
  MessageCircle: <MessageCircle size={20} />,
  PlayCircle: <PlayCircle size={18} />,
  History: <History size={20} />
};

const VideoPlayer = ({ url, title }) => {
  if (!url) return <div className="video-placeholder"><p>Sin video configurado</p></div>;

  let embedUrl = url;
  if (url.includes('youtube.com/watch?v=')) {
    embedUrl = url.replace('watch?v=', 'embed/');
  } else if (url.includes('youtu.be/')) {
    embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
  }

  return (
    <div className="video-viewport">
      <iframe
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

const Link = ({ link, isAdmin, setEditingLink, deleteLink }) => {
  return (
    <div key={link.id} className="link-wrapper">
      <a href={isAdmin ? undefined : link.url} target="_blank" rel="noopener noreferrer" className={`link-card glass ${link.type}`}>
        <div className="link-icon">{ICON_MAP[link.icon]}</div>
        <span className="link-title">{link.title}</span>
        {!isAdmin && <ExternalLink size={16} className="ext-icon" />}
      </a>
      {isAdmin && (
        <div className="admin-actions">
          <button onClick={() => setEditingLink(link)} className="edit-btn"><Edit2 size={16} /></button>
          <button onClick={() => deleteLink(link.id)} className="delete-btn"><Trash2 size={16} /></button>
        </div>
      )}
    </div>
  );
};

function App() {
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [videos, setVideos] = useState(DEFAULT_VIDEOS);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [loading, setLoading] = useState(true);
  const [errorConnection, setErrorConnection] = useState(false);

  // Auth States
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSetup, setShowSetup] = useState(false); // Used for Sign Up now
  const [authError, setAuthError] = useState(null);

  // Content Editing States
  const [editingLink, setEditingLink] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingFooter, setEditingFooter] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(null);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAdmin(!!session);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAdmin(!!session);
    });

    // 3. Load content
    loadContent();

    return () => subscription.unsubscribe();
  }, []);

  const loadContent = async () => {
    try {
      setErrorConnection(false);
      const { data, error } = await supabase
        .from('site_content')
        .select('*');

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        data.forEach(item => {
          switch (item.key) {
            case 'links':
              setLinks(item.value);
              break;
            case 'videos':
              setVideos(item.value);
              break;
            case 'profile':
              setProfile(item.value);
              break;
            case 'footer':
              setFooter(item.value);
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setErrorConnection(true);
    } finally {
      setLoading(false);
    }
  };

  const saveToSupabase = async (key, value) => {
    if (!isAdmin) {
      alert("No tienes permisos para guardar cambios.");
      return;
    }

    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;
      console.log(`✓ ${key} guardado exitosamente`);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      if (window.confirm("¿Cerrar sesión de administrador?")) {
        supabase.auth.signOut();
        setIsAdmin(false);
      }
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setShowLogin(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      alert("Usuario creado exitosamente. ¡Bienvenido!");
      setShowSetup(false);
      // Auto login often happens, but if confirm email is on, it might not.
      // For this simple app, we assume immediate login or user can login.
    }
  };

  const addLink = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newLink = {
      id: Date.now(),
      title: formData.get('title'),
      url: formData.get('url'),
      icon: formData.get('icon'),
      type: formData.get('type')
    };
    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    await saveToSupabase('links', updatedLinks);
    setIsAdding(false);
  };

  const updateLink = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedLinks = links.map(l => l.id === editingLink.id ? {
      ...l,
      title: formData.get('title'),
      url: formData.get('url'),
      icon: formData.get('icon'),
      type: formData.get('type')
    } : l);
    setLinks(updatedLinks);
    await saveToSupabase('links', updatedLinks);
    setEditingLink(null);
  };

  const deleteLink = async (id) => {
    if (window.confirm('¿Eliminar este link?')) {
      const updatedLinks = links.filter(l => l.id !== id);
      setLinks(updatedLinks);
      await saveToSupabase('links', updatedLinks);
    }
  };

  const updateVideo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedVideos = {
      ...videos,
      [editingVideo]: { title: formData.get('title'), url: formData.get('url') }
    };
    setVideos(updatedVideos);
    await saveToSupabase('videos', updatedVideos);
    setEditingVideo(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedProfile = {
      name: formData.get('name'),
      title: formData.get('title'),
      hashtag: formData.get('hashtag'),
      image: tempProfileImage || profile.image
    };
    setProfile(updatedProfile);
    await saveToSupabase('profile', updatedProfile);
    setEditingProfile(false);
    setTempProfileImage(null);
  };

  const updateFooter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedFooter = { text: formData.get('text') };
    setFooter(updatedFooter);
    await saveToSupabase('footer', updatedFooter);
    setEditingFooter(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'white', fontSize: '18px' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <button className={`admin-toggle glass ${isAdmin ? 'active' : ''}`} onClick={handleAdminToggle}>
        {isAdmin ? <X size={20} /> : <Settings size={20} />}
      </button>

      <header className={`profile-header ${isAdmin ? 'admin-highlight' : ''}`}>
        <img src="/logo-clinic-full.png" alt="440 Clinic Logo" className="brand-logo" />
        <div className="profile-img-container">
          <img src={profile.image} alt={profile.name} className="profile-img" />
          {isAdmin && (
            <button className="img-edit-indicator" onClick={() => setEditingProfile(true)}>
              <Camera size={14} />
            </button>
          )}
        </div>
        <div className="header-text-container">
          <h1 className="name">{profile.name}</h1>
          <p className="title">{profile.title}</p>
          <p className="hashtag">{profile.hashtag}</p>
          {isAdmin && (
            <button onClick={() => setEditingProfile(true)} className="section-edit-btn">
              <Edit2 size={14} /> Editar Perfil
            </button>
          )}
        </div>
      </header>

      <main className="content">
        <section className={`video-section glass ${isAdmin ? 'admin-highlight' : ''}`}>
          <div className="video-header">
            <PlayCircle size={20} className="gold-icon" />
            <span>{videos.presentation.title}</span>
            {isAdmin && <button onClick={() => setEditingVideo('presentation')} className="video-edit-btn"><Edit2 size={14} /></button>}
          </div>
          <VideoPlayer url={videos.presentation.url} title={videos.presentation.title} />
        </section>

        <section className="links-section">
          {links.map(link => (
            <Link key={link.id} link={link} isAdmin={isAdmin} setEditingLink={setEditingLink} deleteLink={deleteLink} />
          ))}

          {isAdmin && !isAdding && (
            <button className="add-link-btn glass" onClick={() => setIsAdding(true)}>
              <Plus size={20} /> Agregar Nuevo Link
            </button>
          )}
        </section>

        <section className={`video-section glass ${isAdmin ? 'admin-highlight' : ''}`}>
          <div className="video-header">
            <History size={20} className="gold-icon" />
            <span>{videos.history.title}</span>
            {isAdmin && <button onClick={() => setEditingVideo('history')} className="video-edit-btn"><Edit2 size={14} /></button>}
          </div>
          <VideoPlayer url={videos.history.url} title={videos.history.title} />
        </section>

        {/* Setup Modal (Now Sign Up) */}
        {showSetup && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Crear Cuenta</h2>
                <button onClick={() => { setShowSetup(false); setShowLogin(true); }}><X size={24} /></button>
              </div>
              <p className="modal-subtitle">Regístrate para gestionar tu página.</p>
              <form onSubmit={handleSignUp} className="admin-form">
                <div className="form-group">
                  <label>Email</label>
                  <div className="password-input-wrapper">
                    <User size={16} className="field-icon" />
                    <input name="email" type="email" required placeholder="tu@email.com" autoFocus />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <div className="password-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input type="password" name="password" required placeholder="Contraseña segura" />
                  </div>
                  {authError && <p className="error-message">{authError}</p>}
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Registrarse</button>
              </form>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLogin && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Acceso Administrador</h2>
                <button onClick={() => setShowLogin(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleLogin} className="admin-form">
                <div className="form-group">
                  <label>Email</label>
                  <div className="password-input-wrapper">
                    <User size={16} className="field-icon" />
                    <input name="email" type="email" required autoFocus placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <div className="password-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input type="password" name="password" required placeholder="Tu contraseña" />
                  </div>
                  {authError && <p className="error-message">{authError}</p>}
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Ingresar</button>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowLogin(false); setShowSetup(true); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-bronze)', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    ¿No tienes cuenta? Regístrate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dynamic Modals */}
        {(isAdding || editingLink) && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>{isAdding ? "Nuevo Link" : "Editar Link"}</h2>
                <button onClick={() => { setIsAdding(false); setEditingLink(null); }}><X size={24} /></button>
              </div>
              <form onSubmit={isAdding ? addLink : updateLink} className="admin-form">
                <div className="form-group">
                  <label>Título</label>
                  <input name="title" defaultValue={editingLink?.title} required />
                </div>
                <div className="form-group">
                  <label>URL</label>
                  <input name="url" defaultValue={editingLink?.url} required />
                </div>
                <div className="form-group">
                  <label>Ícono</label>
                  <select name="icon" defaultValue={editingLink?.icon || "Globe"}>
                    <option value="Globe">Web / Globo</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="TikTok">TikTok</option>
                    <option value="MessageCircle">Mensaje</option>
                    <option value="PlayCircle">Video / YouTube</option>
                    <option value="History">Historia</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Botón</label>
                  <select name="type" defaultValue={editingLink?.type || "primary"}>
                    <option value="primary">Primario (Texto Blanco)</option>
                    <option value="social">Social (Transparente)</option>
                    <option value="action">Acción (Resaltado Bronce)</option>
                  </select>
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Guardar</button>
              </form>
            </div>
          </div>
        )}

        {editingVideo && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Editar Video</h2>
                <button onClick={() => setEditingVideo(null)}><X size={24} /></button>
              </div>
              <form onSubmit={updateVideo} className="admin-form">
                <div className="form-group">
                  <label>Título de la Sección</label>
                  <input name="title" defaultValue={videos[editingVideo].title} required />
                </div>
                <div className="form-group">
                  <label>URL (YouTube Embed)</label>
                  <input name="url" defaultValue={videos[editingVideo].url} required />
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Actualizar</button>
              </form>
            </div>
          </div>
        )}

        {editingProfile && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Editar Perfil</h2>
                <button onClick={() => { setEditingProfile(false); setTempProfileImage(null); }}><X size={24} /></button>
              </div>
              <form onSubmit={updateProfile} className="admin-form">
                <div className="form-group">
                  <label>Foto de Perfil</label>
                  <div className="image-upload-preview">
                    <img src={tempProfileImage || profile.image} alt="Preview" />
                    <input type="file" accept="image/*" onChange={handleImageChange} id="profile-img-upload" hidden />
                    <label htmlFor="profile-img-upload" className="upload-btn">
                      <Camera size={16} /> Cambiar Foto
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Nombre</label>
                  <input name="name" defaultValue={profile.name} required />
                </div>
                <div className="form-group">
                  <label>Cargo / Especialidad</label>
                  <input name="title" defaultValue={profile.title} required />
                </div>
                <div className="form-group">
                  <label>Hashtag</label>
                  <input name="hashtag" defaultValue={profile.hashtag} required />
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Actualizar</button>
              </form>
            </div>
          </div>
        )}

        {editingFooter && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Editar Footer</h2>
                <button onClick={() => setEditingFooter(false)}><X size={24} /></button>
              </div>
              <form onSubmit={updateFooter} className="admin-form">
                <div className="form-group">
                  <label>Texto del Footer</label>
                  <input name="text" defaultValue={footer.text} required />
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Actualizar</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className={`footer ${isAdmin ? 'admin-highlight clickable' : ''}`} onClick={isAdmin ? () => setEditingFooter(true) : undefined}>
        <p>&copy; {new Date().getFullYear()} {footer.text}</p>
        {isAdmin && <span className="edit-hint">(Click para editar footer)</span>}
      </footer>
    </div>
  );
}

export default App;
