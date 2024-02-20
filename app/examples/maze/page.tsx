import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "../../debug/constants";

const grid = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

type State = {
  x: number;
  y: number;
};

const initialState: State = { x: 0, y: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;
  return {
    x: buttonIndex === 3
      ? state.x - 1
      : buttonIndex === 4
        ? state.x + 1
        : state.x,
    y: buttonIndex === 1
      ? state.y - 1
      : buttonIndex === 2
        ? state.y + 1
        : state.y
  };
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT
  console.log("info: state is:", state);

  // then, when done, return next frame
  return (
    <div>
      GM Maze example. <Link href="/debug">Debug</Link>
      <FrameContainer
        pathname="/examples/maze"
        postUrl="/examples/maze/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            {grid.map((r, i) => (
              r.map((c, j) => (
                <div
                  key={i + "" + j}
                  style={{
                    background: "yellow",
                    width: "200px",
                    height: "100px",
                    margin: "2px"
                  }}>
                  {state.y === i && state.x === j ? "X" : "-"}
                </div>
              ))
            ))}
            {/* <div style={{
              display: "flex",
              flexDirection: "column",
            }}>
              <p>X is {state.x}</p>
              <p>Y is {state.y}</p>
            </div> */}
          </div>
        </FrameImage>
        <FrameButton onClick={dispatch}>Up</FrameButton>
        <FrameButton onClick={dispatch}>Down</FrameButton>
        <FrameButton onClick={dispatch}>Left</FrameButton>
        <FrameButton onClick={dispatch}>Right</FrameButton>
      </FrameContainer>
    </div>
  );
}
