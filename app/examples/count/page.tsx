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

type State = {
  count: number;
};

const initialState: State = { count: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  return {
    count: state.count + 1,
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
      GM count example. <Link href="/debug">Debug</Link>
      <FrameContainer
        pathname="/examples/count"
        postUrl="/examples/count/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage>
          <div
            style={{
              display: "flex",
              alignItems: "center"
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1527066236128-2ff79f7b9705?q=80&w=2952&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Water"
              style={{
                width: "50%"
              }} />
            <p>Count is {state.count}</p>
          </div>
        </FrameImage>
        <FrameButton onClick={dispatch}>Count</FrameButton>
      </FrameContainer>
    </div>
  );
}
