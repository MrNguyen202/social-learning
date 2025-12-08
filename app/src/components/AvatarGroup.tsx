import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Avatar from "./Avatar";
import { getUserImageSrc } from "../api/image/route";

interface Member {
    id: string;
    avatarUrl: string;
    name: string;
}

export default function AvatarGroup({ members, size }: { members: Member[], size?: number }) {
    if (!members || members.length === 0) return null;

    // Avatar group 3 người
    if (members?.length === 3) {
        return (
            <View style={[styles.containerAvatar3, { width: size, height: size }]}>
                <Avatar style={[styles.avatar3, styles.top3]} uri={getUserImageSrc(members[0]?.avatarUrl)} />
                <Avatar
                    style={[styles.avatar3, styles.bottomLeft3]}
                    uri={getUserImageSrc(members[1]?.avatarUrl)}
                />
                <Avatar
                    style={[styles.avatar3, styles.bottomRight3]}
                    uri={getUserImageSrc(members[2]?.avatarUrl)}
                />
            </View>
        );
    }

    // Avatar group 4 người trở lên
    return (
        <View style={[styles.containerAvatar4, { width: size, height: size }]}>
            <Avatar style={[styles.avatar4, styles.topLeft4]} uri={getUserImageSrc(members[0]?.avatarUrl)} />
            <Avatar style={[styles.avatar4, styles.topRight4]} uri={getUserImageSrc(members[1]?.avatarUrl)} />
            <Avatar style={[styles.avatar4, styles.bottomLeft4]} uri={getUserImageSrc(members[2]?.avatarUrl)} />
            {members?.length > 4 ? (
                <View style={styles.moreContainer4}>
                    <Text style={styles.moreText4}>+{members?.length - 3}</Text>
                </View>
            ) : (
                <Avatar
                    style={[styles.avatar4, styles.bottomRight4]}
                    uri={getUserImageSrc(members[3]?.avatarUrl)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Avatar group 3 người
    containerAvatar3: {
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    avatar3: {
        width: 32,
        height: 32,
        borderRadius: 16,
        position: "absolute",
        borderWidth: 2,
        borderColor: "white",
    },
    top3: {
        top: "-5%",
        left: "50%",
        transform: [{ translateX: -16 }],
    },
    bottomLeft3: {
        bottom: "-5%",
        left: "-8%",
    },
    bottomRight3: {
        bottom: "-5%",
        right: "-8%",
    },

    // Avatar group 4 người
    containerAvatar4: {
        position: "relative",
    },
    avatar4: {
        width: 32,
        height: 32,
        borderRadius: 20,
        position: "absolute",
        borderWidth: 2,
        borderColor: "white",
    },
    topLeft4: {
        top: "2%",
        left: "2%",
    },
    topRight4: {
        top: "2%",
        right: "2%",
    },
    bottomLeft4: {
        bottom: "2%",
        left: "2%",
    },
    bottomRight4: {
        bottom: "2%",
        right: "2%",
    },
    moreContainer4: {
        position: "absolute",
        bottom: "2%",
        right: "2%",
        width: 32,
        height: 32,
        borderRadius: 20,
        backgroundColor: "#bbb",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "white",
    },
    moreText4: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
});
