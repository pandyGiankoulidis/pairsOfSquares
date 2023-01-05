import React, { useEffect, useState } from 'react';
import { useInterval } from '../Lib/utils';
import sound from '../interface-124464.mp3';
import errorSound from '../error-1-126514.mp3';
import { VolumeUp, VolumeMute, CaretLeftFill, Watch, PlayCircle, PauseCircle, Speedometer2, Sc } from 'react-bootstrap-icons';
import Button from "react-bootstrap/Button";
import './Board.css';

const BOARD_SIZE = 10;

const Board = () => {
    const [score, setScore] = useState(0);
    const [reveals, setReveals] = useState(1);
    const [board, setBoard] = useState(createBoard(BOARD_SIZE));
    const [currentCell, setCurrentCell] = useState([-1, -1]);
    const [openCells, setOpenCells] = useState(new Set([]));
    const [displayPlusScore, setDisplayPlusScore] = useState(-1);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const [highScore, setHighScore] = useState(0);
    const [hsTime, setHsTime] = useState(0);
    const [paused, setPaused] = useState(true);
    const [useSoundEffect, setUseSoundEffect] = useState(true);

    const timeout = setTimeout(() => {
        setDisplayPlusScore(-1);
    }, 5000);


    useEffect(() => {
        window.addEventListener('onClick', e => {
            handleClick(e);
        });
        return () => clearTimeout(timeout);
    }, []);

    useInterval(() => {
        openCell();
    }, 150);

    useEffect(() => {
        let interval = null;
        if (timerActive) {
            interval = setInterval(() => {
                setTimer(timer => timer + 1);
            }, 1000);
        } else if (!timerActive && timer !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);


    const handleClick = e => {
    };
    const openCell = () => {
    }
    const applySoundEffects = event => {
        if (useSoundEffect) {
            setUseSoundEffect(false);
        } else {
            setUseSoundEffect(true);
        }
    };

    const revealCell = (event, cellValue) => {

        if (paused) {
            return;
        }
        setMousePosition({ x: event.clientX, y: event.clientY });
        if (openCells.has(cellValue)) {
            return;
        }
        if (currentCell[1] === cellValue[1] && currentCell[0] !== cellValue[0]) {
            playCorrect(useSoundEffect);
            openCells.add(currentCell);
            openCells.add(cellValue);
            setOpenCells(openCells);
            setScore(score + reveals * 10);
            setReveals(reveals + 1);
            setCurrentCell([-1, -1]);
            setDisplayPlusScore(currentCell[0]);
        } else {
            if (currentCell[0] !== -1) {
                setReveals(1);
                playError(useSoundEffect);
                setScore(score - 1);
            }
            setCurrentCell(cellValue);
            setDisplayPlusScore(-1);
        }

        //All cells have revealed
        if (openCells.size === BOARD_SIZE * BOARD_SIZE) {
            if ((score + reveals * 10) > highScore) {
                setHighScore(score + reveals * 10);
                setHsTime(timer);
            }
            setPaused(true);
            setTimerActive(false);
        }

    }

    const pauseGame = () => {
        setPaused(true);
        setTimerActive(false);
    }

    const unpauseGame = () => {
        setPaused(false);
        setTimerActive(true);
    }

    const reset = () => {
        setPaused(true);
        setTimer(0);
        setTimerActive(false);
        setScore(0);
        setReveals(0);
        setCurrentCell([-1, -1]);
        setOpenCells(new Set([]));

    }

    return (
        <>
            <h5><Speedometer2 color="royalblue"></Speedometer2> {highScore} pts. in {hsTime} sec.</h5>
            <h3> {score} pts. <Watch color="royalblue">:</Watch> {timer} sec.</h3>
            <h3><button class="customButton" onClick={paused ? unpauseGame : pauseGame}>{paused ? <PlayCircle class="customPlayPause" color="red"></PlayCircle> : <PauseCircle class="customPlayPause" color="red"></PauseCircle>}</button>
                <button class="customButton" onClick={reset}><CaretLeftFill class="customPlayPause" color="red"></CaretLeftFill></button>
                <button class="customButton" onClick={applySoundEffects}>{useSoundEffect ? <VolumeUp class="customPlayPause" color="royalblue"></VolumeUp> :
                    <VolumeMute class="customPlayPause" color="royalblue"></VolumeMute>}</button></h3>
            <div className="board">
                {board.map((row, rowIdx) => (
                    <div key={rowIdx} className="row">
                        {row.map((cellValue, cellIdx) => {
                            const className = getCellClassName(
                                cellValue,
                                currentCell,
                                openCells
                            );
                            const displayC = openCells.has(cellValue) || currentCell === cellValue ? cellValue[1] : '.';
                            return <div key={cellIdx} className={className} onClick={event => revealCell(event, cellValue)}>
                                {displayC}
                                <div style={{ position: 'absolute', top: mousePosition.y - 10, left: mousePosition.x, color: '#ffd700', fontSize: 30, fontWeight: 900 }}>{displayPlusScore === cellValue[0] ? '+' + (reveals - 1) * 10 : ' '}</div>
                            </div>
                        })}
                    </div>
                ))}
            </div>
        </>
    );
};

//Auxiliary consts
const createBoard = BOARD_SIZE => {
    let counter = 1;
    var occurs = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        occurs.push(0);
    }

    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        const currentRow = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            let v = Math.floor(Math.random() * (BOARD_SIZE)) + 1;
            while (occurs[v - 1] == BOARD_SIZE) {
                v = Math.floor(Math.random() * (BOARD_SIZE)) + 1;
            }
            occurs[v - 1] = occurs[v - 1] + 1;
            currentRow.push([counter++, v]);
        }
        board.push(currentRow);
    }
    return board;
};

const getCellClassName = (
    cellValue,
    currentCell,
    openCells
) => {
    let className = 'cell cell-red';

    if (currentCell == cellValue) className = 'cell-revealed cell-green';
    if (openCells.has(cellValue)) className = 'cell-revealed cell-purple';
    return className;
};

function playCorrect(toplay) {
    if (toplay) {
        new Audio(sound).play();
    }
}

function playError(toplay) {
    if (toplay) {
        new Audio(errorSound).play();
    }
}

export default Board;