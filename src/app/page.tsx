'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart2, Settings, HelpCircle, ArrowLeft, Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const PALAVRAS = ['TERMO', 'TESTE', 'FURIA', 'REACT', 'PIZZA']

export default function TermoGame() {
  const [palavraSecreta] = useState(() => PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)])
  const [tentativas, setTentativas] = useState<string[]>([])
  const [tentativaAtual, setTentativaAtual] = useState('')
  const [jogoTerminado, setJogoTerminado] = useState(false)
  const [tempoJogo, setTempoJogo] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [proximaPalavra, setProximaPalavra] = useState(2400) // 40 minutos em segundos
  const [letraStatus, setLetraStatus] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const timer = setInterval(() => {
      if (!jogoTerminado) {
        setTempoJogo(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [jogoTerminado])

  useEffect(() => {
    const timer = setInterval(() => {
      setProximaPalavra(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const verificarTentativa = useCallback(() => {
    if (tentativaAtual.length === 5) {
      const novasTentativas = [...tentativas, tentativaAtual]
      setTentativas(novasTentativas)

      // Atualizar o status das letras
      const novoLetraStatus = { ...letraStatus }
      for (let i = 0; i < tentativaAtual.length; i++) {
        const letra = tentativaAtual[i]
        if (palavraSecreta[i] === letra) {
          novoLetraStatus[letra] = 'bg-green-500'
        } else if (palavraSecreta.includes(letra) && novoLetraStatus[letra] !== 'bg-green-500') {
          novoLetraStatus[letra] = 'bg-yellow-500'
        } else if (!novoLetraStatus[letra]) {
          novoLetraStatus[letra] = 'bg-neutral-700'
        }
      }
      setLetraStatus(novoLetraStatus)

      setTentativaAtual('')
      
      if (tentativaAtual === palavraSecreta || novasTentativas.length >= 6) {
        setJogoTerminado(true)
        setShowModal(true)
      }
    }
  }, [tentativaAtual, tentativas, palavraSecreta, letraStatus])

  const handleKeyPress = useCallback((letra: string) => {
    if (jogoTerminado) return
    if (letra === 'ENTER') {
      verificarTentativa()
    } else if (letra === 'BACK') {
      setTentativaAtual(prev => prev.slice(0, -1))
    } else if (tentativaAtual.length < 5 && /^[A-Z]$/.test(letra)) {
      setTentativaAtual(prev => prev + letra)
    }
  }, [jogoTerminado, verificarTentativa, tentativaAtual])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleKeyPress('ENTER')
      } else if (event.key === 'Backspace') {
        handleKeyPress('BACK')
      } else if (/^[A-Za-z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  const getLetraStatus = (letra: string, index: number, tentativa: string) => {
    if (palavraSecreta[index] === letra) {
      return 'bg-green-500'
    } else if (palavraSecreta.includes(letra)) {
      return 'bg-yellow-500'
    }
    return 'bg-neutral-700'
  }

  const renderGrid = () => {
    const rows = []
    for (let i = 0; i < 6; i++) {
      const row = []
      for (let j = 0; j < 5; j++) {
        const letra = tentativas[i]?.[j] || (i === tentativas.length ? tentativaAtual[j] : '')
        const status = tentativas[i] ? getLetraStatus(letra, j, tentativas[i]) : 'border-neutral-600'
        row.push(
          <div
            key={`${i}-${j}`}
            className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold text-white m-0.5 ${status}`}
          >
            {letra}
          </div>
        )
      }
      rows.push(
        <div key={i} className="flex justify-center">
          {row}
        </div>
      )
    }
    return rows
  }

  const renderTeclado = () => {
    const linhas = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ]

    return (
      <div className="flex flex-col items-center gap-1.5">
        {linhas.map((linha, i) => (
          <div key={i} className="flex gap-1.5">
            {i === 2 && (
              <button
                onClick={() => handleKeyPress('ENTER')}
                className="px-4 h-14 bg-neutral-700 rounded text-white font-bold"
              >
                ENTER
              </button>
            )}
            {linha.map((letra) => (
              <button
                key={letra}
                onClick={() => handleKeyPress(letra)}
                className={`w-10 h-14 rounded text-white font-bold hover:opacity-80 ${letraStatus[letra] || 'bg-neutral-700'}`}
              >
                {letra}
              </button>
            ))}
            {i === 2 && (
              <button
                onClick={() => handleKeyPress('BACK')}
                className="px-4 h-14 bg-neutral-700 rounded text-white font-bold"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-800 flex flex-col items-center p-4">
        <div className="w-full max-w-xl">
          <header className="flex justify-between items-center mb-8">
            <HelpCircle className="w-6 h-6 text-white opacity-80" />
            <h1 className="text-4xl font-bold text-white">TERMO</h1>
            <div className="flex gap-2">
              <BarChart2 className="w-6 h-6 text-white opacity-80" />
              <Settings className="w-6 h-6 text-white opacity-80" />
            </div>
          </header>

          <div className="mb-8">
            {renderGrid()}
          </div>

          <div className="fixed bottom-4 left-0 right-0 px-4">
            {renderTeclado()}
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-neutral-800 text-white border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {tentativaAtual === palavraSecreta ? 'Parabéns!' : 'Fim de Jogo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-blue-400">Palavra certa: {palavraSecreta}</p>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-4xl font-bold">1</p>
                <p className="text-sm text-neutral-400">jogos</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{tentativas.length}</p>
                <p className="text-sm text-neutral-400">tentativas</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-neutral-400 text-center">Distribuição de tentativas</p>
              <div className="space-y-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-4 text-right">{i + 1}</span>
                    <div className={`h-5 rounded ${i + 1 === tentativas.length ? 'bg-blue-500' : 'bg-neutral-700'}`} 
                         style={{ width: i + 1 === tentativas.length ? '100%' : '0%' }}></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-neutral-400">Próxima palavra em</p>
              <p className="text-2xl font-mono">{formatTime(proximaPalavra)}</p>
            </div>

            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => navigator.clipboard.writeText(`Termo - ${tentativas.length}/6\nTempo: ${formatTime(tempoJogo)}`)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}