// Elementos do DOM
const validationForm = document.getElementById('validationForm');
const certificateCodeInput = document.getElementById('certificateCode');
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');
const certificateModal = document.getElementById('certificateModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close');

// Configurações da API
const API_BASE_URL = window.location.origin;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Focar no input quando a página carregar
    certificateCodeInput.focus();
    
    // Formatação automática do código (maiúsculas)
    certificateCodeInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
    
    // Validação do formulário
    validationForm.addEventListener('submit', handleValidation);
    
    // Fechar modal
    closeModal.addEventListener('click', closeCertificateModal);
    window.addEventListener('click', function(e) {
        if (e.target === certificateModal) {
            closeCertificateModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && certificateModal.style.display === 'block') {
            closeCertificateModal();
        }
    });
});

// Função principal de validação
async function handleValidation(e) {
    e.preventDefault();
    
    const code = certificateCodeInput.value.trim();
    
    if (!code) {
        showError('Por favor, digite um código de certificado.');
        return;
    }
    
    // Validar formato do código (9 caracteres alfanuméricos)
    if (!/^[A-Z0-9]{9}$/.test(code)) {
        showError('O código deve ter exatamente 9 caracteres alfanuméricos.');
        return;
    }
    
    // Mostrar loading
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/validar/${code}`);
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.certificado);
        } else {
            showError(data.message || 'Certificado não encontrado.');
        }
    } catch (error) {
        console.error('Erro na validação:', error);
        showError('Erro de conexão. Tente novamente.');
    }
}

// Mostrar loading
function showLoading() {
    const button = validationForm.querySelector('.btn-validate');
    const originalText = button.innerHTML;
    
    button.disabled = true;
    button.innerHTML = '<div class="loading"></div> Validando...';
    
    // Limpar resultado anterior
    resultContainer.style.display = 'none';
    
    // Restaurar botão após timeout (fallback)
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
    }, 10000);
}

// Mostrar resultado de sucesso
function showSuccess(certificado) {
    const statusClass = certificado.status === 'Válido' ? 'status-valid' : 'status-cancelled';
    const statusIcon = certificado.status === 'Válido' ? 'fa-check-circle' : 'fa-times-circle';
    
    resultContent.innerHTML = `
        <div class="result-content">
            <div class="result-icon">
                <i class="fas ${statusIcon}"></i>
            </div>
            <div class="result-text">
                <h3>Certificado Encontrado!</h3>
                <p>O certificado foi validado com sucesso.</p>
            </div>
        </div>
        
        <div class="certificate-details">
            <h4><i class="fas fa-info-circle"></i> Detalhes do Certificado</h4>
            <div class="detail-row">
                <span class="detail-label">Código:</span>
                <span class="detail-value">${certificado.codigo}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Participante:</span>
                <span class="detail-value">${certificado.nome}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Curso:</span>
                <span class="detail-value">${certificado.curso}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data de Emissão:</span>
                <span class="detail-value">${formatDate(certificado.dataEmissao)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value ${statusClass}">
                    <i class="fas ${statusIcon}"></i> ${certificado.status}
                </span>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button onclick="showCertificateModal('${JSON.stringify(certificado).replace(/'/g, "\\'")}')" 
                    class="btn-validate" style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3);">
                <i class="fas fa-eye"></i> Ver Detalhes Completos
            </button>
        </div>
    `;
    
    resultContainer.className = 'result-container result-success';
    resultContainer.style.display = 'block';
    
    // Restaurar botão
    const button = validationForm.querySelector('.btn-validate');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-check"></i> Validar';
    
    // Scroll para o resultado
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Mostrar erro
function showError(message) {
    resultContent.innerHTML = `
        <div class="result-content">
            <div class="result-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="result-text">
                <h3>Certificado Não Encontrado</h3>
                <p>${message}</p>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <p style="opacity: 0.8; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> 
                Verifique se o código foi digitado corretamente ou entre em contato conosco.
            </p>
        </div>
    `;
    
    resultContainer.className = 'result-container result-error';
    resultContainer.style.display = 'block';
    
    // Restaurar botão
    const button = validationForm.querySelector('.btn-validate');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-check"></i> Validar';
    
    // Scroll para o resultado
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Mostrar modal com detalhes completos
function showCertificateModal(certificadoJson) {
    const certificado = JSON.parse(certificadoJson);
    const statusClass = certificado.status === 'Válido' ? 'status-valid' : 'status-cancelled';
    const statusIcon = certificado.status === 'Válido' ? 'fa-check-circle' : 'fa-times-circle';
    
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <i class="fas fa-certificate" style="font-size: 3rem; color: #667eea; margin-bottom: 15px;"></i>
            <h2 style="color: #333; margin-bottom: 10px;">Certificado Validado</h2>
            <p style="color: #666;">Detalhes completos do certificado</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 15px; padding: 25px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #333; margin: 0;">Informações do Certificado</h3>
                <span class="${statusClass}" style="font-weight: 600; font-size: 1.1rem;">
                    <i class="fas ${statusIcon}"></i> ${certificado.status}
                </span>
            </div>
            
            <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="color: #495057;">Código de Validação:</strong>
                    <span style="font-family: monospace; font-size: 1.1rem; color: #667eea;">${certificado.codigo}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="color: #495057;">Nome do Participante:</strong>
                    <span style="color: #333;">${certificado.nome}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="color: #495057;">Curso/Programa:</strong>
                    <span style="color: #333;">${certificado.curso}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <strong style="color: #495057;">Data de Emissão:</strong>
                    <span style="color: #333;">${formatDate(certificado.dataEmissao)}</span>
                </div>
            </div>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #4CAF50; border-radius: 10px; padding: 15px; text-align: center;">
            <i class="fas fa-shield-alt" style="color: #4CAF50; font-size: 1.5rem; margin-bottom: 10px;"></i>
            <p style="color: #2e7d32; margin: 0; font-weight: 500;">
                Este certificado foi validado em nosso sistema oficial.
            </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="background: #667eea; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; margin-right: 10px;">
                <i class="fas fa-print"></i> Imprimir
            </button>
            <button onclick="closeCertificateModal()" style="background: #6c757d; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer;">
                <i class="fas fa-times"></i> Fechar
            </button>
        </div>
    `;
    
    certificateModal.style.display = 'block';
}

// Fechar modal
function closeCertificateModal() {
    certificateModal.style.display = 'none';
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Função para gerar código de exemplo (para demonstração)
function generateSampleCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Adicionar exemplo de código no placeholder (opcional)
window.addEventListener('load', function() {
    // Mostrar código de exemplo no placeholder
    const sampleCode = generateSampleCode();
    certificateCodeInput.placeholder = `Ex: ${sampleCode}`;
});

// Função para limpar formulário
function clearForm() {
    validationForm.reset();
    resultContainer.style.display = 'none';
    certificateCodeInput.focus();
}

// Adicionar botão de limpar (opcional)
document.addEventListener('DOMContentLoaded', function() {
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.innerHTML = '<i class="fas fa-eraser"></i> Limpar';
    clearButton.className = 'btn-validate';
    clearButton.style.background = 'rgba(255,255,255,0.2)';
    clearButton.style.border = '2px solid rgba(255,255,255,0.3)';
    clearButton.style.marginTop = '10px';
    clearButton.onclick = clearForm;
    
    validationForm.appendChild(clearButton);
}); 