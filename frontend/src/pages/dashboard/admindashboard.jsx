/**
 * DASHBOARD DE ADMINISTRACIÓN
 * Solo para PROFESSIONAL_ADMIN
 */

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, RefreshCw, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    phone: '',
    email: '',
    username: '',
    role: 'PROFESSIONAL'
  });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/admin/professionals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfessionals(response.data.data);
    } catch (error) {
      toast.error('Error cargando profesionales');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('accessToken');
    
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/admin/professionals/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Profesional actualizado');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/professionals',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Profesional creado. Credenciales enviadas por email.');
      }
      
      setShowModal(false);
      resetForm();
      loadProfessionals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error guardando profesional');
    }
  };

  const handleEdit = (professional) => {
    setEditingId(professional.id);
    setFormData({
      name: professional.name,
      specialty: professional.specialty || '',
      description: professional.description || '',
      phone: professional.phone,
      email: professional.email,
      username: professional.username,
      role: professional.role
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return;

    const token = localStorage.getItem('accessToken');
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/professionals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profesional eliminado');
      loadProfessionals();
    } catch (error) {
      toast.error('Error eliminando profesional');
    }
  };

  const handleResetPassword = async (id, name) => {
    if (!confirm(`¿Resetear contraseña de ${name}?`)) return;

    const token = localStorage.getItem('accessToken');
    
    try {
      await axios.post(
        `http://localhost:5000/api/admin/professionals/${id}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Contraseña reseteada. Nueva contraseña enviada por email.');
    } catch (error) {
      toast.error('Error reseteando contraseña');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      description: '',
      phone: '',
      email: '',
      username: '',
      role: 'PROFESSIONAL'
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-900 mb-2">
            Administración
          </h1>
          <p className="text-dark-600">Gestiona el equipo de profesionales</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          <UserPlus className="w-5 h-5" />
          <span>Nuevo Profesional</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-600 text-sm">Total Profesionales</p>
              <p className="text-3xl font-bold text-dark-900">{professionals.length}</p>
            </div>
            <Users className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-600 text-sm">Disponibles</p>
              <p className="text-3xl font-bold text-green-600">
                {professionals.filter(p => p.is_available).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-600 text-sm">Administradores</p>
              <p className="text-3xl font-bold text-blue-600">
                {professionals.filter(p => p.role === 'PROFESSIONAL_ADMIN').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl">
              👑
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-dark-700">Profesional</th>
                <th className="text-left py-4 px-6 font-semibold text-dark-700">Especialidad</th>
                <th className="text-left py-4 px-6 font-semibold text-dark-700">Contacto</th>
                <th className="text-left py-4 px-6 font-semibold text-dark-700">Rol</th>
                <th className="text-left py-4 px-6 font-semibold text-dark-700">Estado</th>
                <th className="text-right py-4 px-6 font-semibold text-dark-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((prof) => (
                <tr key={prof.id} className="border-t border-dark-100 hover:bg-dark-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-dark-900">{prof.name}</p>
                      <p className="text-sm text-dark-600">@{prof.username}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-dark-600">{prof.specialty || '-'}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="text-dark-900">{prof.phone}</p>
                      <p className="text-dark-600">{prof.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      prof.role === 'PROFESSIONAL_ADMIN'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-dark-100 text-dark-700'
                    }`}>
                      {prof.role === 'PROFESSIONAL_ADMIN' ? '👑 Admin' : 'Profesional'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      prof.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {prof.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(prof)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(prof.id, prof.name)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                        title="Resetear contraseña"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prof.id, prof.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Profesional' : 'Nuevo Profesional'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Especialidad</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    disabled={!!editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Usuario *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    disabled={!!editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rol *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="PROFESSIONAL">Profesional</option>
                    <option value="PROFESSIONAL_ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              {!editingId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    ℹ️ Se generará una contraseña temporal y se enviará por email
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border-2 border-dark-300 rounded-lg hover:bg-dark-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingId ? 'Actualizar' : 'Crear Profesional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;