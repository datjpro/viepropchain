import React from 'react'
import { Outlet } from "react-router-dom";
import Header from '../components/Header/header'
import Footer from '../components/Footer/footer'
export const Layout = () => {
    return (
        <div className=''>
            <Header />
            <main className="">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
