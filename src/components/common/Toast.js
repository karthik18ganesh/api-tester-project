// src/components/common/Toast.js
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = () => <ToastContainer position="bottom-center" autoClose={3000} />;

export default Toast;
