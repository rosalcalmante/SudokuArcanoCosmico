document.addEventListener('DOMContentLoaded', () => {
    const sudokuGrid = document.getElementById('sudoku-grid');
    const numbersPanel = document.querySelector('.numbers-panel');
    const newGameBtn = document.getElementById('new-game-btn');
    const difficultySelect = document.getElementById('difficulty');
    const solveBtn = document.getElementById('solve-btn');
    const resetBtn = document.getElementById('reset-btn');
    const messageArea = document.getElementById('message-area');

    let selectedCell = null;
    let initialGrid = []; // Almacena el problema original
    let currentGrid = []; // Almacena el estado actual del juego

    // Sudoku puzzles (0 representa celdas vacías)
    // He añadido algunos puzzles más interesantes.
    // Fuente: Ejemplos de Sudokus comunes.
    const puzzles = {
        easy: [
            [5,3,0,0,7,0,0,0,0],
            [6,0,0,1,9,5,0,0,0],
            [0,9,8,0,0,0,0,6,0],
            [8,0,0,0,6,0,0,0,3],
            [4,0,0,8,0,3,0,0,1],
            [7,0,0,0,2,0,0,0,6],
            [0,6,0,0,0,0,2,8,0],
            [0,0,0,4,1,9,0,0,5],
            [0,0,0,0,8,0,0,7,9]
        ],
        medium: [
            [0,0,0,6,0,0,4,0,0],
            [7,0,0,0,0,3,6,0,0],
            [0,0,0,0,9,1,0,8,0],
            [0,0,7,0,0,0,0,0,0],
            [0,5,0,1,8,0,0,0,3],
            [0,0,0,3,0,6,0,4,5],
            [0,4,0,2,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,5],
            [0,0,0,0,0,0,0,7,0]
        ],
        hard: [
            [0,0,0,0,0,0,0,1,2],
            [0,0,0,0,0,5,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0] // Este es un puzzle difícil, para un verdadero desafío, reemplazar con uno más complejo.
        ]
    };

    // --- Lógica Central del Sudoku (Resolutor) ---
    function solveSudoku(board) {
        const N = 9;

        function findEmpty(board) {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (board[r][c] === 0) {
                        return [r, c];
                    }
                }
            }
            return null;
        }

        function isValid(board, num, pos) {
            const [row, col] = pos;

            // Revisar fila
            for (let c = 0; c < N; c++) {
                if (board[row][c] === num && col !== c) {
                    return false;
                }
            }

            // Revisar columna
            for (let r = 0; r < N; r++) {
                if (board[r][col] === num && row !== r) {
                    return false;
                }
            }

            // Revisar caja 3x3
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = boxRow; r < boxRow + 3; r++) {
                for (let c = boxCol; c < boxCol + 3; c++) {
                    if (board[r][c] === num && r !== row && c !== col) {
                        return false;
                    }
                }
            }
            return true;
        }

        function solve(currentBoard) {
            const find = findEmpty(currentBoard);
            if (!find) {
                return true; // Sudoku resuelto
            } else {
                const [row, col] = find;

                for (let i = 1; i <= 9; i++) {
                    if (isValid(currentBoard, i, [row, col])) {
                        currentBoard[row][col] = i;

                        if (solve(currentBoard)) {
                            return true;
                        }

                        currentBoard[row][col] = 0; // Backtrack
                    }
                }
                return false;
            }
        }
        
        // Hacer una copia profunda para no modificar el currentGrid original durante la resolución
        const boardCopy = JSON.parse(JSON.stringify(board));
        if (solve(boardCopy)) {
            return boardCopy;
        }
        return null; // No hay solución
    }

    // --- Renderizado de la Interfaz ---
    function renderGrid(gridData) {
        sudokuGrid.innerHTML = ''; // Limpiar cuadrícula previa
        gridData.forEach((row, rowIndex) => {
            row.forEach((num, colIndex) => {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = rowIndex;
                cell.dataset.col = colIndex;
                cell.textContent = num !== 0 ? num : '';

                if (initialGrid[rowIndex][colIndex] !== 0) {
                    cell.classList.add('prefilled');
                } else if (num !== 0) {
                    cell.classList.add('user-input');
                }

                cell.addEventListener('click', () => selectCell(cell));
                sudokuGrid.appendChild(cell);
            });
        });
    }

    function renderNumbersPanel() {
        numbersPanel.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => fillSelectedCell(i));
            numbersPanel.appendChild(button);
        }
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Borrar';
        clearButton.classList.add('clear');
        clearButton.addEventListener('click', () => fillSelectedCell(0));
        numbersPanel.appendChild(clearButton);
    }

     // --- Lógica de Interacción ---
    function selectCell(cell) {
        // Primero, quitar la clase 'selected' de la celda previamente seleccionada (si existe)
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            // Opcional: limpiar errores de la celda previamente seleccionada al deseleccionar
            selectedCell.classList.remove('error'); 
        }

        // Si la celda clickeada NO es una celda predefinida, la seleccionamos
        if (!cell.classList.contains('prefilled')) {
            cell.classList.add('selected');
            selectedCell = cell; // ¡Actualizar la celda seleccionada!
        } else {
            selectedCell = null; // Si es predefinida, no hay celda seleccionada
            showMessage('No puedes alterar los números cósmicos.', 'error');
        }
        showMessage(''); // Limpiar cualquier mensaje anterior al seleccionar una celda
    }

    function fillSelectedCell(number) {
        // Asegurarse de que hay una celda seleccionada Y que no es predefinida
        if (selectedCell && !selectedCell.classList.contains('prefilled')) {
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);

            // Actualizar el valor en nuestra matriz de juego
            currentGrid[row][col] = number;

            // Actualizar el texto en la interfaz (0 significa celda vacía)
            selectedCell.textContent = number !== 0 ? number : '';

            // Gestionar las clases CSS para el estilo
            selectedCell.classList.remove('user-input', 'error'); // Limpiar clases anteriores
            if (number !== 0) {
                selectedCell.classList.add('user-input'); // Si es un número del usuario, añadir la clase
            }
            
            // Opcional: Validación instantánea (descomentar si quieres ver errores al escribir)
            // if (number !== 0 && !isValid(currentGrid, number, [row, col])) {
            //     selectedCell.classList.add('error');
            //     showMessage('Movimiento inválido. Intenta de nuevo.', 'error');
            // } else {
            //     selectedCell.classList.remove('error');
            //     showMessage('');
            // }
            
            // Comprobar si el Sudoku está resuelto después de cada movimiento
            if (isSolved(currentGrid)) {
                showMessage('¡Felicidades! Galaxia Descifrada.', 'success');
            } else {
                showMessage(''); // Limpiar el mensaje si no está resuelto
            }

        } else if (selectedCell && selectedCell.classList.contains('prefilled')) {
            showMessage('No puedes alterar los números cósmicos.', 'error');
        } else {
            showMessage('Selecciona una celda estelar primero.', 'error');
        }
    }

    // Comprobar si la cuadrícula actual está completamente y correctamente resuelta
    function isSolved(grid) {
        // Primero, verificar si hay celdas vacías
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    return false; // No está completamente lleno
                }
            }
        }
        // Luego, verificar si la cuadrícula llena es válida
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const num = grid[r][c];
                // Temporalmente limpiar la celda para verificar la validez de su propio número
                grid[r][c] = 0; 
                if (!isValid(grid, num, [r,c])) {
                    grid[r][c] = num; // Restaurar valor
                    return false; // Colocación inválida
                }
                grid[r][c] = num; // Restaurar valor
            }
        }
        return true; // Completamente lleno y válido
    }

    // --- Funciones de Control del Juego ---
    function newGame() {
        const difficulty = difficultySelect.value;
        const puzzle = puzzles[difficulty];
        
        if (!puzzle || puzzle.length !== 9 || puzzle.some(row => row.length !== 9)) {
            console.warn(`Puzzle para dificultad '${difficulty}' no encontrado o malformado. Usando puzzle fácil.`);
            initialGrid = JSON.parse(JSON.stringify(puzzles.easy));
        } else {
            initialGrid = JSON.parse(JSON.stringify(puzzle)); // Copia profunda
        }
        
        currentGrid = JSON.parse(JSON.stringify(initialGrid)); // Copia profunda para el estado actual
        renderGrid(currentGrid);
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
        showMessage('');
    }

    function solveCurrentSudoku() {
        // Crear una copia resoluble de la cuadrícula actual para no afectar initialGrid
        const solvableGrid = JSON.parse(JSON.stringify(initialGrid));
        
        // Rellenar las entradas del usuario para un punto de partida completo para el resolutor
        for(let r = 0; r < 9; r++) {
            for(let c = 0; c < 9; c++) {
                if(initialGrid[r][c] === 0 && currentGrid[r][c] !== 0) {
                    solvableGrid[r][c] = currentGrid[r][c];
                }
            }
        }

        const solution = solveSudoku(solvableGrid);
        if (solution) {
            currentGrid = solution; // Actualizar cuadrícula actual con la versión resuelta
            renderGrid(currentGrid);
            showMessage('¡Verdades Reveladas! Sudoku Resuelto.', 'success');
        } else {
            showMessage('El cosmos es indescifrable... No se encontró solución para este enigma.', 'error');
        }
    }

    function resetGame() {
        currentGrid = JSON.parse(JSON.stringify(initialGrid)); // Restablecer al estado inicial
        renderGrid(currentGrid);
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
        showMessage('Órbita Reiniciada. Juego restaurado.');
    }

    function showMessage(msg, type = 'info') {
        messageArea.textContent = msg;
        messageArea.className = 'message-area'; // Restablecer clases
        if (msg) {
            messageArea.classList.add(type);
        }
    }
    
    // --- Configuración Inicial ---
    newGameBtn.addEventListener('click', newGame);
    difficultySelect.addEventListener('change', newGame); // Nuevo juego al cambiar dificultad
    solveBtn.addEventListener('click', solveCurrentSudoku);
    resetBtn.addEventListener('click', resetGame);

    renderNumbersPanel(); // Renderizar botones numéricos una vez
    newGame(); // Iniciar un nuevo juego cuando la página carga
});