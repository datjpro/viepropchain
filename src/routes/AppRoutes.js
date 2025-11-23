import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home  from '../pages/Home/Home'
import { Layout } from '../layouts/Layout';
import { AboutUs } from '../pages/AboutUs/AboutUs';
import { Vision } from '../pages/Vision/Vision';
import { ProductSolution } from '../pages/ProductSolution/ProductSolution';
import { Technology } from '../pages/Technology/Technology';
import { Terms } from '../pages/Terms/Terms';
import { Security } from '../pages/Security/Security';
import { Partner } from '../pages/Partner/Partner';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about-us" element={<AboutUs />} />
                <Route path="vision" element={<Vision />} />
                <Route path="product-solution" element={<ProductSolution/>} />
                <Route path="terms" element={<Terms/>} />
                <Route path="technology" element={<Technology/>} />
                <Route path="security" element={<Security/>} />
                <Route path="partner" element={<Partner/>} />
            </Route>

        </Routes>
    )
}
