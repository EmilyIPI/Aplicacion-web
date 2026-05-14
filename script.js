window.onload = function() {
    lucide.createIcons();

    const prenda = document.getElementById('prenda-base');
    const logoVisor = document.getElementById('diseno-reflejado-container');
    const logoImgVisor = document.getElementById('diseno-reflejado-img');
    const designLayer = document.getElementById('design-layer');
    const canvas = document.getElementById('canvas-container');
    const userDesignImg = document.getElementById('user-design-img');
    
    const guideH = document.getElementById('guide-h');
    const guideV = document.getElementById('guide-v');

    let isDragging = false;
    let isResizing = false;

    // --- FUNCIÓN DE ACTUALIZACIÓN Y SINCRONIZACIÓN ---
    function updateSync(x, y, width) {
        const rect = canvas.getBoundingClientRect();
        
        if (x === undefined) x = parseFloat(designLayer.style.left);
        if (y === undefined) y = parseFloat(designLayer.style.top);
        if (width === undefined) width = designLayer.offsetWidth;

        designLayer.style.left = x + 'px';
        designLayer.style.top = y + 'px';
        designLayer.style.width = width + 'px';

        const pctX = (x / rect.width) * 100;
        const pctY = (y / rect.height) * 100;
        logoVisor.style.left = (pctX + 15) + '%'; 
        logoVisor.style.top = (pctY + 25) + '%';
        logoVisor.style.width = (width * 0.7) + 'px';

        const centerX = x + (width / 2);
        const centerY = y + (designLayer.offsetHeight / 2);
        const threshold = 3; 

        if (Math.abs(centerX - rect.width / 2) < threshold) {
            guideV.style.display = 'block';
        } else {
            guideV.style.display = 'none';
        }

        if (Math.abs(centerY - rect.height / 2) < threshold) {
            guideH.style.display = 'block';
        } else {
            guideH.style.display = 'none';
        }
    }

    // --- 1. DRAG & RESIZE ---
    designLayer.onmousedown = function(e) {
        if (e.target.classList.contains('resize-handle')) {
            isResizing = true;
        } else {
            isDragging = true;
            designLayer.style.cursor = 'grabbing';
        }
        e.preventDefault();
    };

    document.onmousemove = function(e) {
        const rect = canvas.getBoundingClientRect();

        if (isResizing) {
            let newWidth = e.clientX - designLayer.getBoundingClientRect().left;
            if (newWidth > 30 && newWidth < 180) {
                updateSync(undefined, undefined, newWidth);
            }
        }

        if (isDragging) {
            let x = e.clientX - rect.left - (designLayer.offsetWidth / 2);
            let y = e.clientY - rect.top - (designLayer.offsetHeight / 2);

            x = Math.max(0, Math.min(x, rect.width - designLayer.offsetWidth));
            y = Math.max(0, Math.min(y, rect.height - designLayer.offsetHeight));

            updateSync(x, y, undefined);
        }
    };

    document.onmouseup = () => {
        isDragging = false;
        isResizing = false;
        designLayer.style.cursor = 'move';
        guideH.style.display = 'none';
        guideV.style.display = 'none';
    };

    // --- 2. NUEVA LÓGICA DE MATERIALES ---
    const botonesMaterial = document.querySelectorAll('.mat-btn');
    botonesMaterial.forEach(btn => {
        btn.onclick = function() {
            botonesMaterial.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const modo = this.getAttribute('data-blend');
            // Quitamos las clases anteriores y ponemos la nueva
            logoVisor.classList.remove('blend-multiply', 'blend-overlay', 'blend-screen');
            logoVisor.classList.add('blend-' + modo);
        };
    });

    // --- 3. BOTONES DE ALINEACIÓN ---
    document.getElementById('align-h').onclick = () => {
        const rect = canvas.getBoundingClientRect();
        const centerX = (rect.width / 2) - (designLayer.offsetWidth / 2);
        updateSync(centerX, undefined, undefined);
    };

    document.getElementById('align-v').onclick = () => {
        const rect = canvas.getBoundingClientRect();
        const centerY = (rect.height / 2) - (designLayer.offsetHeight / 2);
        updateSync(undefined, centerY, undefined);
    };

    // --- 4. ACCIONES DE DISEÑO ---
    const inputArchivo = document.getElementById('input-archivo');
    document.getElementById('btn-subir').onclick = () => inputArchivo.click();

    inputArchivo.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                userDesignImg.src = event.target.result;
                logoImgVisor.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('btn-eliminar').onclick = () => {
        if(confirm("¿Eliminar diseño?")) {
            userDesignImg.src = "";
            logoImgVisor.src = "";
        }
    };

    // --- 5. LÓGICA DE MODALES ---
    const modalGaleria = document.getElementById('modal-galeria');
    const modalCuenta = document.getElementById('modal-cuenta');

    document.getElementById('link-galeria').onclick = (e) => {
        e.preventDefault();
        modalGaleria.style.display = 'flex';
    };

    document.getElementById('link-cuenta').onclick = (e) => {
        e.preventDefault();
        modalCuenta.style.display = 'flex';
    };

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            modalGaleria.style.display = 'none';
            modalCuenta.style.display = 'none';
        };
    });

    // --- 6. GESTIÓN DE PERFIL ---
    const btnEditar = document.getElementById('btn-editar-nombre');
    const nombreSpan = document.getElementById('nombre-usuario');
    const avatar = document.getElementById('user-avatar');

    btnEditar.onclick = () => {
        nombreSpan.contentEditable = true;
        nombreSpan.focus();
    };

    nombreSpan.onblur = () => {
        nombreSpan.contentEditable = false;
        const partes = nombreSpan.innerText.trim().split(' ');
        const iniciales = partes.map(p => p[0]).join('').toUpperCase().substring(0, 2);
        avatar.innerText = iniciales || '??';
    };

    nombreSpan.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            nombreSpan.blur();
        }
    };

    document.getElementById('btn-logout').onclick = () => {
        if(confirm(`¿Cerrar sesión de ${nombreSpan.innerText}?`)) {
            location.reload();
        }
    };

    // --- 7. VISTAS Y COLORES ---
    document.getElementById('btn-frente').onclick = function() {
        prenda.src = 'frente.png';
        logoVisor.style.opacity = '1';
        this.classList.add('active-view');
        document.getElementById('btn-espalda').classList.remove('active-view');
    };

    document.getElementById('btn-espalda').onclick = function() {
        prenda.src = 'espalda.png';
        logoVisor.style.opacity = '0';
        this.classList.add('active-view');
        document.getElementById('btn-frente').classList.remove('active-view');
    };

    const botonesColor = document.querySelectorAll('.color-btn');
    botonesColor.forEach(btn => {
        btn.onclick = function() {
            botonesColor.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const color = this.getAttribute('data-color');
            prenda.style.filter = (color === 'black') ? 'brightness(0.3) contrast(1.1)' : 'brightness(1) contrast(1)';
        };
    });

    document.querySelectorAll('.mini-logo').forEach(logo => {
        logo.onclick = () => {
            userDesignImg.src = logo.src;
            logoImgVisor.src = logo.src;
            modalCuenta.style.display = 'none';
        };
    });
};
