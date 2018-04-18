import { Group } from '../models';
import { mustBeOwner, mustBeOwnerOrAdmin } from './security';

export const Participant = {
    group: (participant) => {
        return Group.findById(participant.group);
    },
    jwt: (participant, args, ctx) => {
        mustBeOwner(ctx, ctx.participant, participant);
        return ctx.participant.jwt;
    },
    distance: (participant, args, ctx) => {
        mustBeOwnerOrAdmin(ctx, ctx.participant, participant);
        return ctx.participant.distance;
    },
    latitude: (participant, args, ctx) => {
        mustBeOwnerOrAdmin(ctx, ctx.participant, participant);
        return ctx.participant.latitude;
    },
    longitude: (participant, args, ctx) => {
        mustBeOwnerOrAdmin(ctx, ctx.participant, participant);
        return ctx.participant.longitude;
    },
    state: (participant, args, ctx) => {
        mustBeOwnerOrAdmin(ctx, ctx.participant, participant);
        return ctx.participant.state;
    }
};