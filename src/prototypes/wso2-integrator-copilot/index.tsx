import { useState } from 'react';
import NotesPanel from './NotesPanel';
import CopilotPanel from './CopilotPanel';

export default function WSO2CopilotPrototype() {
    const [chatState, setChatState] = useState('empty');
    const [inputMode, setInputMode] = useState('build');
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuIndex, setSlashMenuIndex] = useState(0);

    const handleStartGeneration = () => {
        setChatState(inputMode === 'plan' ? 'plan-generating' : 'generating');
    };

    const handleReset = () => {
        setChatState('empty');
        setInputMode('build');
    };

    const handleAction = (action: string) => {
        switch (action) {
            case 'empty': handleReset(); break;
            case 'generating': handleStartGeneration(); break;
            case 'review': setChatState('review'); break;
            case 'accepted': setChatState('accepted'); break;
            case 'slashMenu': handleReset(); setShowSlashMenu(true); setSlashMenuIndex(0); break;
            case 'planMode': setInputMode('plan'); break;
            case 'buildMode': setInputMode('build'); break;
            case 'planReview': setChatState('plan-review'); break;
            case 'planRevised': setChatState('plan-revised'); break;
            case 'planBuilding': setChatState('plan-building-1'); break;
            case 'planComplete': setChatState('plan-complete'); break;
        }
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 font-sans">
            <NotesPanel onAction={handleAction} />
            <CopilotPanel
                chatState={chatState}
                setChatState={setChatState}
                inputMode={inputMode}
                setInputMode={setInputMode}
                showSlashMenu={showSlashMenu}
                setShowSlashMenu={setShowSlashMenu}
                slashMenuIndex={slashMenuIndex}
                setSlashMenuIndex={setSlashMenuIndex}
                onStartGeneration={handleStartGeneration}
                onReset={handleReset}
            />
        </div>
    );
}
