/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SurveyProvider } from './context/SurveyContext';
import { NotificationProvider } from './context/NotificationContext';
import { GamificationProvider } from './context/GamificationContext';
import { MainView } from './components/MainView';

export default function App() {
  return (
    <GamificationProvider>
      <SurveyProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
            <MainView />
          </div>
        </NotificationProvider>
      </SurveyProvider>
    </GamificationProvider>
  );
}
