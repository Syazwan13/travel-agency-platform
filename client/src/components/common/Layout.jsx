import React from 'react';
import { Footer } from "../../routes";
import PropTypes from "prop-types";

export const Layout = ({children}) => {
    return (
        <>
            <main className="pt-20 mt-4">{children}</main>
            <Footer/>
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.any,
};