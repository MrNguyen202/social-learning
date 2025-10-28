import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
    TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());
    TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());
    TrackPlayer.addEventListener('remote-jump-forward', async () => {
        let position = await TrackPlayer.getPosition();
        let duration = await TrackPlayer.getDuration();
        position = Math.min(position + 10, duration);
        TrackPlayer.seekTo(position);
    });
    TrackPlayer.addEventListener('remote-jump-backward', async () => {
        let position = await TrackPlayer.getPosition();
        position = Math.max(position - 10, 0);
        TrackPlayer.seekTo(position);
    });
};