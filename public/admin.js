// Configurações da API
const API_BASE_URL = window.location.origin;

// Elementos do DOM
const addCertificateForm = document.getElementById('addCertificateForm');
const alertContainer = document.getElementById('alertContainer');
const certificatesList = document.getElementById('certificatesList');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Formatação automática do código (maiúsculas)
    const codigoInput = document.getElementById('codigo');
    codigoInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
    
    // Validação do formulário
    addCertificateForm.addEventListener('submit', handleAddCertificate);
    
    // Carregar certificados quando a página carregar
    loadCertificates();
});

// Função para alternar entre abas
function showTab(tabName) {
    // Remover classe active de todas as abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Adicionar classe active na aba selecionada
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Se for a aba de listagem, recarregar os dados
    if (tabName === 'list') {
        loadCertificates();
    }
}

// Função para adicionar certificado
async function handleAddCertificate(e) {
    e.preventDefault();
    
    const formData = new FormData(addCertificateForm);
    const certificateData = {
        codigo: formData.get('codigo').trim(),
        nome: formData.get('nome').trim(),
        curso: formData.get('curso').trim(),
        dataEmissao: formData.get('dataEmissao'),
        status: formData.get('status')
    };
    
    // Validações
    if (!certificateData.codigo || !certificateData.nome || !certificateData.curso || !certificateData.dataEmissao) {
        showAlert('Todos os campos obrigatórios devem ser preenchidos.', 'error');
        return;
    }
    
    if (!/^[A-Z0-9]{9}$/.test(certificateData.codigo)) {
        showAlert('O código deve ter exatamente 9 caracteres alfanuméricos.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/certificados`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(certificateData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Se houver PDF, faz upload
            const diplomaFile = formData.get('diploma');
            if (diplomaFile && diplomaFile.size > 0) {
                const uploadForm = new FormData();
                uploadForm.append('codigo', certificateData.codigo);
                uploadForm.append('diploma', diplomaFile);
                try {
                    const uploadResp = await fetch(`${API_BASE_URL}/api/certificados/upload`, {
                        method: 'POST',
                        body: uploadForm
                    });
                    const uploadData = await uploadResp.json();
                    if (uploadData.success) {
                        showAlert('Certificado e diploma anexados com sucesso!', 'success');
                    } else {
                        showAlert('Certificado salvo, mas erro ao anexar diploma.', 'error');
                    }
                } catch {
                    showAlert('Certificado salvo, mas erro ao anexar diploma.', 'error');
                }
            } else {
                showAlert('Certificado adicionado com sucesso!', 'success');
            }
            addCertificateForm.reset();
            showQrAfterAdd(certificateData.codigo);
        } else {
            showAlert(data.message || 'Erro ao adicionar certificado.', 'error');
        }
    } catch (error) {
        console.error('Erro ao adicionar certificado:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    }
}

// Função para carregar certificados
async function loadCertificates() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/certificados`);
        const data = await response.json();
        
        if (data.success) {
            displayCertificates(data.certificados);
        } else {
            showAlert('Erro ao carregar certificados.', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar certificados:', error);
        certificatesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>Erro ao carregar certificados. Tente novamente.</p>
            </div>
        `;
    }
}

// Função para exibir certificados
function displayCertificates(certificates) {
    if (certificates.length === 0) {
        certificatesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>Nenhum certificado encontrado.</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <table class="certificates-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Curso</th>
                    <th>Data de Emissão</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${certificates.map(cert => `
                    <tr>
                        <td><strong>${cert.codigo}</strong></td>
                        <td>${cert.nome}</td>
                        <td>${cert.curso}</td>
                        <td>${formatDate(cert.data_emissao)}</td>
                        <td>
                            <span class="status-badge ${cert.status === 'Válido' ? 'status-valid' : 'status-cancelled'}">
                                ${cert.status}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-small btn-edit" onclick="editCertificate('${cert.codigo}')" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-small btn-delete" onclick="deleteCertificate('${cert.codigo}')" title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="btn-small btn-primary" onclick="openQrModal('${cert.codigo}')" title="Ver QR Code">
                                    <i class="fas fa-qrcode"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: center; color: #666;">
            <p><i class="fas fa-info-circle"></i> Total de certificados: ${certificates.length}</p>
        </div>
    `;
    
    certificatesList.innerHTML = tableHTML;
}

// Função para editar certificado
function editCertificate(codigo) {
    // Implementar funcionalidade de edição
    alert(`Funcionalidade de edição para o certificado ${codigo} será implementada em breve.`);
}

// Função para excluir certificado
async function deleteCertificate(codigo) {
    if (!confirm(`Tem certeza que deseja excluir o certificado ${codigo}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/certificados/${codigo}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Certificado excluído com sucesso!', 'success');
            loadCertificates(); // Recarregar lista
        } else {
            showAlert(data.message || 'Erro ao excluir certificado.', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir certificado:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    }
}

// Função para atualizar status do certificado
async function updateCertificateStatus(codigo, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/certificados/${codigo}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Status atualizado com sucesso!', 'success');
            loadCertificates(); // Recarregar lista
        } else {
            showAlert(data.message || 'Erro ao atualizar status.', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    }
}

// Função para mostrar alertas
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Remover alerta após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Função para gerar código automático
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('codigo').value = result;
}

// Adicionar botão para gerar código automático
document.addEventListener('DOMContentLoaded', function() {
    const codigoGroup = document.querySelector('.form-group');
    const generateButton = document.createElement('button');
    generateButton.type = 'button';
    generateButton.innerHTML = '<i class="fas fa-magic"></i> Gerar Código';
    generateButton.className = 'btn-primary';
    generateButton.style.marginTop = '10px';
    generateButton.onclick = generateCode;
    
    codigoGroup.appendChild(generateButton);
});

// Função para exportar certificados (opcional)
function exportCertificates() {
    // Implementar exportação para CSV/Excel
    alert('Funcionalidade de exportação será implementada em breve.');
}

// Função para buscar certificados
function searchCertificates(query) {
    // Implementar busca
    console.log('Buscando por:', query);
}

// Função para exibir QR Code após adicionar certificado
async function showQrAfterAdd(codigo) {
    const qrDiv = document.getElementById('qrAfterAdd');
    qrDiv.style.display = 'block';
    qrDiv.innerHTML = '<div class="loading"></div> Gerando QR Code...';
    try {
        const response = await fetch(`${API_BASE_URL}/api/qrcode/${codigo}`);
        const data = await response.json();
        if (data.success) {
            qrDiv.innerHTML = `
                <div style="text-align:center;">
                    <h3 style="color:#006341; margin-bottom:10px;">QR Code do Certificado</h3>
                    <img src="${data.qrCode}" alt="QR Code" style="max-width:180px; margin-bottom:10px; background:#fff; border-radius:12px; padding:8px; border:1px solid #eee;">
                    <p style="font-size:0.95rem; color:#006341; margin-bottom:8px;">Escaneie ou acesse:<br><a href="${data.validationUrl}" target="_blank">${data.validationUrl}</a></p>
                </div>
            `;
        } else {
            qrDiv.innerHTML = '<span style="color:#f44336;">Erro ao gerar QR Code.</span>';
        }
    } catch {
        qrDiv.innerHTML = '<span style="color:#f44336;">Erro ao gerar QR Code.</span>';
    }
}

// Função para abrir modal de QR Code
async function openQrModal(codigo) {
    const modal = document.getElementById('qrModal');
    const content = document.getElementById('qrModalContent');
    content.innerHTML = '<div class="loading"></div> Gerando QR Code...';
    modal.style.display = 'block';
    try {
        const response = await fetch(`${API_BASE_URL}/api/qrcode/${codigo}`);
        const data = await response.json();
        if (data.success) {
            content.innerHTML = `
                <div style="text-align:center;">
                    <h3 style="color:#006341; margin-bottom:10px;">QR Code do Certificado</h3>
                    <img src="${data.qrCode}" alt="QR Code" style="max-width:180px; margin-bottom:10px; background:#fff; border-radius:12px; padding:8px; border:1px solid #eee;">
                    <p style="font-size:0.95rem; color:#006341; margin-bottom:8px;">Escaneie ou acesse:<br><a href="${data.validationUrl}" target="_blank">${data.validationUrl}</a></p>
                </div>
            `;
        } else {
            content.innerHTML = '<span style="color:#f44336;">Erro ao gerar QR Code.</span>';
        }
    } catch {
        content.innerHTML = '<span style="color:#f44336;">Erro ao gerar QR Code.</span>';
    }
}

// Fechar modal QR
function closeQrModal() {
    document.getElementById('qrModal').style.display = 'none';
}
document.getElementById('closeQrModal').onclick = closeQrModal;
window.onclick = function(event) {
    if (event.target === document.getElementById('qrModal')) closeQrModal();
};

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeQrModal();
}); 