
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <span className="l">L</span>
        <span className="o">o</span>
        <span className="a">a</span>
        <span className="d">d</span>
        <span className="i">i</span>
        <span className="n">n</span>
        <span className="g">g</span>
        <span className="d1">.</span>
        <span className="d2">.</span>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .l {
    color: black;
    opacity: 0;
    animation: pass 2s ease-in-out infinite;
    animation-delay: 0.2s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .o {
    color: black;
    opacity: 0;
    animation: pass 2s ease-in-out infinite;
    animation-delay: 0.4s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .a {
    color: black;
    opacity: 0;
    animation: pass 2s ease-in-out infinite;
    animation-delay: 0.6s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .d {
    color: black;
    opacity: 0;
    animation: pass 2s ease-in-out infinite;
    animation-delay: 0.8s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .i {
    color: black;
    opacity: 0;
    animation: pass 2s ease-in-out infinite;
    animation-delay: 1s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .n {
    color: black;
    opacity: 0;
    animation: pass 2s ease-in-out infinite;
    animation-delay: 1.2s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .g {
    color: black;
    opacity: 0;
    animation: pass 2s ease-in-out infinite;
    animation-delay: 1.4s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .d1 {
    color: black;
    opacity: 0;
    animation: pass1 2s ease-in-out infinite;
    animation-delay: 1.6s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  .d2 {
    color: black;
    opacity: 0;
    animation: pass1 2s ease-in-out infinite;
    animation-delay: 2s;
    letter-spacing: 0.5em;
    text-shadow: 2px 2px 3px #919191;
  }

  @keyframes pass {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes pass1 {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
`;

export default Loader; 