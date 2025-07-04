const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./certificados.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        initDatabase();
    }
});

// Configuração do multer para upload de PDF
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './public/diplomas';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Salva como codigo_do_certificado.pdf
        const codigo = req.body.codigo ? req.body.codigo.toUpperCase() : 'certificado';
        cb(null, `${codigo}.pdf`);
    }
});
const upload = multer({ storage: storage, fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Apenas arquivos PDF são permitidos!'));
}});

// Inicializar banco de dados
function initDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS certificados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        curso TEXT NOT NULL,
        data_emissao TEXT NOT NULL,
        status TEXT DEFAULT 'Válido',
        diploma_pdf TEXT,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela:', err.message);
        } else {
            console.log('Tabela certificados criada ou já existe.');
            // Inserir dados de exemplo
            insertSampleData();
        }
    });
}

// Inserir dados de exemplo
function insertSampleData() {
    const sampleData = [
        ['ABC123XYZ', 'Jeferson da Costa Martins', 'Técnico de Documentação', '2014-08-20', 'Válido'],
        ['XYZ789ABC', 'Maria Oliveira', 'Curso de Marketing Digital', '2025-01-10', 'Válido'],
        ['DEF456GHI', 'Pedro Santos', 'Workshop de Liderança', '2025-01-20', 'Válido'],
        ['JKL012MNO', 'Ana Costa', 'Certificação em Segurança da Informação', '2024-12-15', 'Válido'],
        ['PQR345STU', 'Carlos Ferreira', 'Treinamento em Gestão de Projetos', '2024-11-30', 'Cancelado']
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO certificados (codigo, nome, curso, data_emissao, status) VALUES (?, ?, ?, ?, ?)');
    
    sampleData.forEach(row => {
        stmt.run(row, (err) => {
            if (err) {
                console.error('Erro ao inserir dados de exemplo:', err.message);
            }
        });
    });
    
    stmt.finalize();
}

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Validar certificado
app.get('/api/validar/:codigo', (req, res) => {
    const codigo = req.params.codigo.toUpperCase();
    
    db.get('SELECT * FROM certificados WHERE codigo = ?', [codigo], (err, row) => {
        if (err) {
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        } else if (row) {
            res.json({
                success: true,
                certificado: {
                    codigo: row.codigo,
                    nome: row.nome,
                    curso: row.curso,
                    dataEmissao: row.data_emissao,
                    status: row.status
                }
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Certificado não encontrado' 
            });
        }
    });
});

// API: Listar todos os certificados (para administração)
app.get('/api/certificados', (req, res) => {
    db.all('SELECT * FROM certificados ORDER BY data_criacao DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        } else {
            res.json({
                success: true,
                certificados: rows
            });
        }
    });
});

// API: Adicionar novo certificado
app.post('/api/certificados', (req, res) => {
    const { codigo, nome, curso, dataEmissao, status = 'Válido' } = req.body;
    
    if (!codigo || !nome || !curso || !dataEmissao) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos obrigatórios devem ser preenchidos'
        });
    }
    
    db.run('INSERT INTO certificados (codigo, nome, curso, data_emissao, status) VALUES (?, ?, ?, ?, ?)',
        [codigo.toUpperCase(), nome, curso, dataEmissao, status],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({
                        success: false,
                        message: 'Código de certificado já existe'
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'Erro interno do servidor'
                    });
                }
            } else {
                res.json({
                    success: true,
                    message: 'Certificado adicionado com sucesso',
                    id: this.lastID
                });
            }
        }
    );
});

// API: Atualizar status do certificado
app.put('/api/certificados/:codigo/status', (req, res) => {
    const codigo = req.params.codigo.toUpperCase();
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status é obrigatório'
        });
    }
    
    db.run('UPDATE certificados SET status = ? WHERE codigo = ?', [status, codigo], function(err) {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        } else if (this.changes > 0) {
            res.json({
                success: true,
                message: 'Status atualizado com sucesso'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Certificado não encontrado'
            });
        }
    });
});

// API: Excluir certificado
app.delete('/api/certificados/:codigo', (req, res) => {
    const codigo = req.params.codigo.toUpperCase();
    
    db.run('DELETE FROM certificados WHERE codigo = ?', [codigo], function(err) {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        } else if (this.changes > 0) {
            res.json({
                success: true,
                message: 'Certificado excluído com sucesso'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Certificado não encontrado'
            });
        }
    });
});

// API: Gerar QR Code para certificado
app.get('/api/qrcode/:codigo', async (req, res) => {
    const codigo = req.params.codigo.toUpperCase();
    
    try {
        // Verificar se o certificado existe
        db.get('SELECT * FROM certificados WHERE codigo = ?', [codigo], async (err, row) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            } else if (row) {
                // Gerar URL de validação
                const validationUrl = `${req.protocol}://${req.get('host')}/validar/${codigo}`;
                
                // Gerar QR Code
                const qrCodeDataURL = await QRCode.toDataURL(validationUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                
                res.json({
                    success: true,
                    qrCode: qrCodeDataURL,
                    validationUrl: validationUrl,
                    certificado: {
                        codigo: row.codigo,
                        nome: row.nome,
                        curso: row.curso,
                        dataEmissao: row.data_emissao,
                        status: row.status
                    }
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Certificado não encontrado'
                });
            }
        });
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao gerar QR Code'
        });
    }
});

// Rota para validação direta via URL
app.get('/validar/:codigo', (req, res) => {
    const codigo = req.params.codigo.toUpperCase();
    res.sendFile(path.join(__dirname, 'public', 'validar.html'));
});

// Rota para upload de diploma PDF
app.post('/api/certificados/upload', upload.single('diploma'), (req, res) => {
    const codigo = req.body.codigo ? req.body.codigo.toUpperCase() : null;
    if (!codigo || !req.file) {
        return res.status(400).json({ success: false, message: 'Código e arquivo são obrigatórios.' });
    }
    const diplomaPath = `/diplomas/${req.file.filename}`;
    db.run('UPDATE certificados SET diploma_pdf = ? WHERE codigo = ?', [diplomaPath, codigo], function(err) {
        if (err) {
            res.status(500).json({ success: false, message: 'Erro ao associar diploma.' });
        } else {
            res.json({ success: true, message: 'Diploma associado com sucesso.', diploma_pdf: diplomaPath });
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
}); 