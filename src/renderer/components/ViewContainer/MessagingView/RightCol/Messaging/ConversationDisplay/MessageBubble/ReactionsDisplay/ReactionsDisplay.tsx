/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { Message as DBMessage, Chat } from "@server/databases/chat/entity";
import { getSender, generateReactionsDisplayIconText } from "@renderer/helpers/utils";
import ReactionParticipant from "./ReactionParticipant/ReactionParticipant";

import "./ReactionsDisplay.css";

type Message = DBMessage & {
    tempGuid: string;
    reactions: DBMessage[];
    reactionsChecked: boolean;
};

interface Props {
    message: Message;
}

interface State {
    displayedReactions: Array<Array<any>>;
    reactionTypes: object;
    containsNegatives: boolean;
}

class ReactionsDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            displayedReactions: [[], [], []],
            reactionTypes: {},
            containsNegatives: false
        };
    }

    componentDidMount() {
        // 0=avatar, 1=sender Handle, 2=reactionType
        const displayedReactions = [[], [], []];
        const reactionTypes = {};

        // Get all the reaction types
        if (this.props.message.reactions) {
            for (let i = 0; i < this.props.message.reactions.length; i += 1) {
                displayedReactions[0].push(this.props.message.reactions[i].handle?.avatar);
                displayedReactions[1].push(this.props.message.reactions[i].handle);
                displayedReactions[2].push(this.props.message.reactions[i].associatedMessageType);
            }

            for (let i = 0; i < displayedReactions[2].length; i += 1) {
                if (displayedReactions[2][i] in reactionTypes) {
                    reactionTypes[displayedReactions[2][i]] += 1;
                } else {
                    reactionTypes[displayedReactions[2][i]] = 1;
                }
            }

            // Check if the message contains a "-" reaction (AKA a reaction that was set, and then removed)
            for (let i = 0; i < displayedReactions[2].length; i += 1) {
                if (displayedReactions[2][i][0] === "-") {
                    this.setState({ containsNegatives: true });
                }
            }
        }

        this.setState({ displayedReactions });
        this.setState({ reactionTypes });
    }

    render() {
        return (
            <>
                {this.props.message.reactions && !this.state.containsNegatives ? (
                    this.state.displayedReactions[1].map((array, i) => (
                        <>
                            {Object.keys(this.state.reactionTypes).length > 1 ? (
                                <ReactionParticipant
                                    reactionSender={this.state.displayedReactions[1][i]}
                                    reactionType={this.state.displayedReactions[2][i]}
                                />
                            ) : (
                                <ReactionParticipant
                                    reactionSender={this.state.displayedReactions[1][i]}
                                    reactionType={this.state.displayedReactions[2][i]}
                                />
                            )}
                        </>
                    ))
                ) : (
                    <>
                        <p className="nothingPlaceholder">Nothing Yet&nbsp;&nbsp;&nbsp;</p>
                        <p className="nothingEmoji">&#128550;</p>
                    </>
                )}
            </>
        );
    }
}

export default ReactionsDisplay;
