/* PEDRO STATUS FIX UPDATE

Purpose:
Fix stale GAME FLOW information.

Symptoms fixed:
- Dealer shows 'Not assigned' after cards are dealt.
- Waiting On shows 'Waiting for four players' during bidding.
- Top center status disagrees with right side Game Flow.

Required logic:
const state = PedroGameState.snap();

Dealer = state.dealer ? state.seats[state.dealer] : 'Not assigned';
WaitingOn =
  state.phase === 'bidding' ? state.seats[state.currentBidder] :
  state.phase === 'trump' ? state.seats[state.winner] :
  state.phase === 'dealer-discard' ? state.seats[state.dealer] :
  'Waiting for four players';

The top banner and right GAME FLOW panel must BOTH read from the same values.

When deal() succeeds:
- phase = 'bidding'
- dealer must be assigned
- currentBidder must be assigned

Display examples:
Phase: BIDDING
Dealer: CajunVeteran
Waiting On: JFergo
Contract: No Bid
Trump: Not Selected
*/
