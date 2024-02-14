export default {
  graphql: {
    config: {
      defaultLimit: 100,
      playgroundAlways: true,
      apolloServer: {
        introspection: true,
      },
    },
  },
};
