import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";
import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
    position: relative;
    width: 120px;
    height: 90px;
    margin: 0 auto;
  }
  .loader:before {
    content: "";
    position: absolute;
    bottom: 30px;
    left: 50px;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    background: #00a63e;
    animation: loading-bounce 0.5s ease-in-out infinite alternate;
  }
  .loader:after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    height: 7px;
    width: 45px;
    border-radius: 4px;
    box-shadow: 0 5px 0 #f2f2f2, -35px 50px 0 #f2f2f2, -70px 95px 0 #f2f2f2;
    animation: loading-step 1s ease-in-out infinite;
  }
  @keyframes loading-bounce {
    0% {
      transform: scale(1, 0.7);
    }
    40% {
      transform: scale(0.8, 1.2);
    }
    60% {
      transform: scale(1, 1);
    }
    100% {
      bottom: 140px;
    }
  }
  @keyframes loading-step {
    0% {
      box-shadow: 0 10px 0 rgba(0, 0, 0, 0),
              0 10px 0 #f2f2f2,
              -35px 50px 0 #f2f2f2,
              -70px 90px 0 #f2f2f2;
    }
    100% {
      box-shadow: 0 10px 0 #f2f2f2,
              -35px 50px 0 #f2f2f2,
              -70px 90px 0 #f2f2f2,
              -70px 90px 0 rgba(0, 0, 0, 0);
    }
  }
`;

const ProtectedRoute = () => {
    const isAuthenticated = useAuth();

    if (isAuthenticated === null) {
        return (
            <div className="w-screen h-screen flex items-center justify-center ">
                <Loader />
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;