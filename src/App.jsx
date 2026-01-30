import { useState, useEffect } from 'react';
import { Instagram, Globe, MessageCircle, PlayCircle, History, ExternalLink, Settings, X, Plus, Trash2, Edit2, Check, Camera, Lock, User, ShieldCheck } from 'lucide-react';
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
  Instagram: <Instagram size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  PlayCircle: <PlayCircle size={20} />,
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

function App() {
  const [links, setLinks] = useState(() => {
    const saved = localStorage.getItem('440_links');
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });

  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem('440_videos');
    if (!saved) return DEFAULT_VIDEOS;
    const parsed = JSON.parse(saved);
    const migrated = {};
    Object.keys(DEFAULT_VIDEOS).forEach(key => {
      if (typeof parsed[key] === 'string') {
        migrated[key] = { title: DEFAULT_VIDEOS[key].title, url: parsed[key] };
      } else {
        migrated[key] = parsed[key];
      }
    });
    return migrated;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('440_profile');
    if (!saved) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
  });

  const [footer, setFooter] = useState(() => {
    const saved = localStorage.getItem('440_footer');
    return saved ? JSON.parse(saved) : DEFAULT_FOOTER;
  });

  // Security States
  const [adminAuth, setAdminAuth] = useState(() => {
    const saved = localStorage.getItem('440_admin_config');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('440_auth') === 'true');
  const [showLogin, setShowLogin] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Content Editing States
  const [editingLink, setEditingLink] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingFooter, setEditingFooter] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState(false);

  useEffect(() => {
    localStorage.setItem('440_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('440_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('440_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('440_footer', JSON.stringify(footer));
  }, [footer]);

  useEffect(() => {
    if (adminAuth) {
      localStorage.setItem('440_admin_config', JSON.stringify(adminAuth));
    }
  }, [adminAuth]);

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      sessionStorage.removeItem('440_auth');
    } else {
      if (!adminAuth) {
        setShowSetup(true);
      } else {
        setShowLogin(true);
      }
    }
  };

  const handleSetup = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const config = {
      username: formData.get('username'),
      password: formData.get('password')
    };
    setAdminAuth(config);
    setIsAdmin(true);
    setShowSetup(false);
    sessionStorage.setItem('440_auth', 'true');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (formData.get('username') === adminAuth.username && formData.get('password') === adminAuth.password) {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError(false);
      sessionStorage.setItem('440_auth', 'true');
    } else {
      setLoginError(true);
    }
  };

  const updateSecurity = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setAdminAuth({
      username: formData.get('username'),
      password: formData.get('password')
    });
    setEditingSecurity(false);
    alert('Credenciales actualizadas correctamente');
  };

  const addLink = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newLink = {
      id: Date.now(),
      title: formData.get('title'),
      url: formData.get('url'),
      icon: formData.get('icon'),
      type: formData.get('type')
    };
    setLinks([...links, newLink]);
    setIsAdding(false);
  };

  const updateLink = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = links.map(l => l.id === editingLink.id ? {
      ...l,
      title: formData.get('title'),
      url: formData.get('url'),
      icon: formData.get('icon'),
      type: formData.get('type')
    } : l);
    setLinks(updated);
    setEditingLink(null);
  };

  const deleteLink = (id) => {
    if (window.confirm('¿Eliminar este link?')) {
      setLinks(links.filter(l => l.id !== id));
    }
  };

  const updateVideo = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTitle = formData.get('title');
    const newUrl = formData.get('url');
    setVideos(prev => ({
      ...prev,
      [editingVideo]: { title: newTitle, url: newUrl }
    }));
    setEditingVideo(null);
  };

  const [tempProfileImage, setTempProfileImage] = useState(null);

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

  const updateProfile = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setProfile({
      name: formData.get('name'),
      title: formData.get('title'),
      hashtag: formData.get('hashtag'),
      image: tempProfileImage || profile.image
    });
    setEditingProfile(false);
    setTempProfileImage(null);
  };

  const updateFooter = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setFooter({
      text: formData.get('text')
    });
    setEditingFooter(false);
  };

  return (
    <div className="container">
      <button className={`admin-toggle glass ${isAdmin ? 'active' : ''}`} onClick={handleAdminToggle}>
        {isAdmin ? <X size={20} /> : <Settings size={20} />}
      </button>

      {isAdmin && (
        <button className="security-settings-btn glass" onClick={() => setEditingSecurity(true)}>
          <ShieldCheck size={20} />
        </button>
      )}

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

        {/* Setup Modal (First Time) */}
        {showSetup && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Configurar Administrador</h2>
                <button onClick={() => setShowSetup(false)}><X size={24} /></button>
              </div>
              <p className="modal-subtitle">Crea un usuario y contraseña para gestionar tu página.</p>
              <form onSubmit={handleSetup} className="admin-form">
                <div className="form-group">
                  <label>Nombre de Usuario</label>
                  <div className="password-input-wrapper">
                    <User size={16} className="field-icon" />
                    <input name="username" required placeholder="Ej: drgio_admin" autoFocus />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <div className="password-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input type="password" name="password" required placeholder="Crea una contraseña segura" />
                  </div>
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Crear Administrador</button>
              </form>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showLogin && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Acceso Administrador</h2>
                <button onClick={() => setShowLogin(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleLogin} className="admin-form">
                <div className="form-group">
                  <label>Usuario</label>
                  <div className="password-input-wrapper">
                    <User size={16} className="field-icon" />
                    <input name="username" required autoFocus placeholder="Tu usuario" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <div className="password-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input type="password" name="password" required placeholder="Tu contraseña" />
                  </div>
                  {loginError && <p className="error-message">Credenciales incorrectas</p>}
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Ingresar</button>
              </form>
            </div>
          </div>
        )}

        {/* Security Settings Modal */}
        {editingSecurity && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass active">
              <div className="modal-header">
                <h2>Configuración de Seguridad</h2>
                <button onClick={() => setEditingSecurity(false)}><X size={24} /></button>
              </div>
              <form onSubmit={updateSecurity} className="admin-form">
                <div className="form-group">
                  <label>Nuevo Usuario</label>
                  <div className="password-input-wrapper">
                    <User size={16} className="field-icon" />
                    <input name="username" defaultValue={adminAuth.username} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña</label>
                  <div className="password-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input type="password" name="password" defaultValue={adminAuth.password} required />
                  </div>
                </div>
                <button type="submit" className="submit-btn"><Check size={20} /> Guardar Cambios</button>
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
                    <option value="MessageCircle">Mensaje / WhatsApp</option>
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
