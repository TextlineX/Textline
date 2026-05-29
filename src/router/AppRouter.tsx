import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {HomePage} from '../pages/home'
import {ProjectPage} from '../pages/projects'
import {AboutPage} from '../pages/about'

type AppRouterProps = {
  isBootComplete: boolean
}

export function AppRouter({ isBootComplete }: AppRouterProps) {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage isBootComplete={isBootComplete}/>}/>
                <Route path="/projects" element={<ProjectPage/>}/>
                <Route path="/about" element={<AboutPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}
