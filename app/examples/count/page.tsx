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
      GM user data example. <Link href="/debug">Debug</Link>
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
              flexDirection: "column",
            }}
          >
            Count is {state.count}
          </div>
        </FrameImage>
        <FrameButton onClick={dispatch}>Count</FrameButton>
      </FrameContainer>
    </div>
  );
}
