// Função para extrair o código da URL
function getCodigoFromUrl() {
    const path = window.location.pathname;
    const match = path.match(/\/validar\/(\w{9})/);
    return match ? match[1] : null;
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

async function carregarCertificado() {
    const codigo = getCodigoFromUrl();
    if (!codigo) {
        mostrarErro('Código de certificado inválido na URL.');
        return;
    }

    try {
        // Buscar dados do certificado e QR Code
        const response = await fetch(`/api/qrcode/${codigo}`);
        const data = await response.json();

        document.getElementById('loadingContent').style.display = 'none';

        if (data.success) {
            // Exibir informações do certificado
            const cert = data.certificado;
            const statusClass = cert.status === 'Válido' ? 'status-valid' : 'status-cancelled';
            const statusIcon = cert.status === 'Válido' ? 'fa-check-circle' : 'fa-times-circle';

            let diplomaBtn = '';
            if (cert.diploma_pdf) {
                diplomaBtn = `<button onclick="window.open('${cert.diploma_pdf}','_blank')" style="background: #FFD700; color: #006341; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; margin-right: 10px; font-weight:600;">
                    <i class='fas fa-file-pdf'></i> Ver Diploma
                </button>`;
            }
            
            document.getElementById('certificateInfo').innerHTML = `
                <h2 style="color: #333; margin-bottom: 10px;">Certificado Validado</h2>
                <div style="margin-bottom: 20px;">
                    <span class="${statusClass}" style="font-weight: 600; font-size: 1.1rem;">
                        <i class="fas ${statusIcon}"></i> ${cert.status}
                    </span>
                </div>
                <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                        <strong style="color: #495057;">Código:</strong>
                        <span style="font-family: monospace; font-size: 1.1rem; color: #667eea;">${cert.codigo}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                        <strong style="color: #495057;">Nome:</strong>
                        <span style="color: #333;">${cert.nome}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                        <strong style="color: #495057;">Curso:</strong>
                        <span style="color: #333;">${cert.curso}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                        <strong style="color: #495057;">Data de Emissão:</strong>
                        <span style="color: #333;">${formatDate(cert.dataEmissao)}</span>
                    </div>
                </div>
            `;
            // Exibir QR Code
            document.getElementById('qrCodeContainer').innerHTML = `<img src="${data.qrCode}" alt="QR Code">`;
            document.getElementById('certificateContent').style.display = 'block';
        } else {
            mostrarErro(data.message || 'Certificado não encontrado.');
        }
    } catch (error) {
        mostrarErro('Erro ao buscar certificado.');
    }
}

function mostrarErro(msg) {
    document.getElementById('loadingContent').style.display = 'none';
    document.getElementById('certificateContent').style.display = 'none';
    document.getElementById('errorContent').style.display = 'block';
    document.getElementById('errorMessage').textContent = msg;
}

// Iniciar busca ao carregar a página
document.addEventListener('DOMContentLoaded', carregarCertificado);

// Mostrar modal com detalhes completos
function showCertificateModal(certificadoJson) {
    const certificado = JSON.parse(certificadoJson);
    const statusClass = certificado.status === 'Válido' ? 'status-valid' : 'status-cancelled';
    const statusIcon = certificado.status === 'Válido' ? 'fa-check-circle' : 'fa-times-circle';
    
    let diplomaBtn = '';
    if (certificado.diploma_pdf) {
        diplomaBtn = `<button onclick="window.open('${certificado.diploma_pdf}','_blank')" style="background: #FFD700; color: #006341; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; margin-right: 10px; font-weight:600;">
            <i class='fas fa-file-pdf'></i> Ver Diploma
        </button>`;
    }
    
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
            ${diplomaBtn}
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
