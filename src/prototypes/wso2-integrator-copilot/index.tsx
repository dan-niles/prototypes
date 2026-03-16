import { useState } from 'react';
import NotesPanel from './NotesPanel';
import CopilotPanel from './CopilotPanel';

export default function WSO2CopilotPrototype() {
    const [chatState, setChatState] = useState('empty');
    const [inputMode, setInputMode] = useState('build');
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuIndex, setSlashMenuIndex] = useState(0);
    const [authProvider, setAuthProvider] = useState('wso2-cloud');
    const [headerMode, setHeaderMode] = useState<'bi' | 'mi'>('bi');

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
            case 'authWso2': setAuthProvider('wso2-cloud'); break;
            case 'authAnthropic': setAuthProvider('anthropic'); break;
            case 'authBedrock': setAuthProvider('aws-bedrock'); break;
            case 'authVertex': setAuthProvider('vertex-ai'); break;
            case 'headerBI': setHeaderMode('bi'); break;
            case 'headerMI': setHeaderMode('mi'); break;
            case 'thinking': setChatState('thinking'); break;
            case 'thoughtComplete': setChatState('thought-complete'); break;
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
                authProvider={authProvider}
                headerMode={headerMode}
            />
        </div>
    );
}
