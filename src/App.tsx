import cn from 'classnames'
import { memo, useReducer } from 'react'
import './App.css'

type Player = 'red' | 'yellow'
type Token = undefined | Player
type TBoard = Token[][]

const genEmptyBoard = (): TBoard =>
  Array(7)
    .fill(undefined)
    .map(() => Array(6).fill(undefined))

// Utility to test pre-filled board:
// const genEmptyBoard = (): TBoard => [
//   [undefined, undefined, undefined, undefined, undefined, undefined],
//   [undefined, undefined, undefined, undefined, undefined, undefined],
//   [undefined, undefined, undefined, undefined, undefined, undefined],
//   [undefined, undefined, undefined, undefined, 'red', 'yellow'],
//   [undefined, undefined, undefined, 'red', 'yellow', 'red'],
//   [undefined, undefined, undefined, undefined, 'red', 'yellow'],
//   [undefined, undefined, undefined, undefined, undefined, 'red'],
// ]

const genNewBoard = (
  board: TBoard,
  playedColumn: number,
  currentPlayer: Player
): TBoard => {
  return board.map((column, i) => {
    if (i === playedColumn) {
      const newColumn = [...column]
      for (let index = newColumn.length - 1; index >= 0; index--) {
        if (newColumn[index] === undefined) {
          newColumn[index] = currentPlayer
          break
        }
      }
      return newColumn
    }
    return column
  })
}

function canPlay(column: Token[]) {
  return column.some((cell) => cell === undefined)
}

function checkIfWinner(board: TBoard, player: Player) {
  // vertical check
  for (let j = 0; j < 7; j++) {
    const column = board[j]
    for (let i = 0; i < 3; i++) {
      if (
        column[i] == player &&
        column[i + 1] == player &&
        column[i + 2] == player &&
        column[i + 3] == player
      ) {
        return true
      }
    }
  }

  // horizontal check
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 7; j++) {
      if (
        board[i][j] == player &&
        board[i + 1][j] == player &&
        board[i + 2][j] == player &&
        board[i + 3][j] == player
      ) {
        return true
      }
    }
  }

  // diagonal going up
  for (let i = 0; i < 4; i++) {
    for (let j = 5; j > 2; j--) {
      if (
        board[i][j] == player &&
        board[i + 1][j - 1] == player &&
        board[i + 2][j - 2] == player &&
        board[i + 3][j - 3] == player
      ) {
        return true
      }
    }
  }

  // diagonal going down
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        board[i][j] == player &&
        board[i + 1][j + 1] == player &&
        board[i + 2][j + 2] == player &&
        board[i + 3][j + 3] == player
      ) {
        return true
      }
    }
  }

  return false
}

function initState(player: Player): State {
  return {
    currentPlayer: player,
    winner: null,
    board: genEmptyBoard()
  }
}

type Action =
  | {
      type: 'turn'
      payload: number
    }
  | {
      type: 'reset'
      payload: Player
    }
interface State {
  currentPlayer: Player
  winner: Player | null
  board: TBoard
}
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'turn':
      if (!canPlay(state.board[action.payload])) {
        return state
      }
      const newBoard = genNewBoard(
        state.board,
        action.payload,
        state.currentPlayer
      )
      const currentPlayerWins = checkIfWinner(newBoard, state.currentPlayer)
      if (currentPlayerWins) {
        return {
          ...state,
          winner: state.currentPlayer,
          board: newBoard
        }
      } else {
        return {
          ...state,
          currentPlayer: state.currentPlayer === 'red' ? 'yellow' : 'red',
          board: newBoard
        }
      }
    case 'reset':
      return initState(action.payload)
    default:
      throw new Error()
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, 'red', initState)

  function resetGame(player: Player) {
    dispatch({ type: 'reset', payload: player })
  }

  return (
    <div className="App">
      {state.winner && (
        <WinnerOverlay winner={state.winner} onClick={resetGame} />
      )}
      <h1 className="Title">Connect 4</h1>
      <div className="Turn">
        <div className="TurnText">Player turn:</div>
        <Cell token={state.currentPlayer} size={20} />
      </div>
      <div className="Board">
        {state.board.map((column, i) => (
          <Column
            key={i}
            column={column}
            onClick={() => dispatch({ type: 'turn', payload: i })}
          />
        ))}
      </div>
    </div>
  )
}

interface ColumnProps {
  column: Token[]
  onClick: () => void
}
function ColumnRaw({ column, onClick }: ColumnProps) {
  return (
    <div className="Column" onClick={onClick}>
      {column.map((token, i) => (
        <Cell key={i} token={token} />
      ))}
    </div>
  )
}
function areEqual(prevProps: ColumnProps, nextProps: ColumnProps) {
  for (let i = 0; i < prevProps.column.length; i++) {
    if (prevProps.column[i] !== nextProps.column[i]) return false
  }
  return true
}
const Column = memo(ColumnRaw, areEqual)

const Cell = memo(function CellRaw({
  token,
  size
}: {
  token: Token
  size?: number
}) {
  let style: React.CSSProperties = {}
  if (size) {
    style = {
      borderRadius: size,
      width: size,
      height: size,
      margin: 0
    }
  }
  return (
    <div
      style={style}
      className={cn('Cell', {
        'Cell-red': token === 'red',
        'Cell-yellow': token === 'yellow'
      })}
    />
  )
})

function WinnerOverlay({
  winner,
  onClick
}: {
  winner: Player
  onClick: (player: Player) => void
}) {
  return (
    <div className="Overlay">
      <div className="Modal">
        <h1>
          <Cell token={winner} size={20} />
          <span>{winner} wins!</span>
        </h1>
        <button onClick={() => onClick(winner === 'red' ? 'yellow' : 'red')}>
          Rematch
        </button>
      </div>
    </div>
  )
}

export default App
