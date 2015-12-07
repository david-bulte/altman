class ListCardDirective {

    constructor() {
        'ngInject';

        return {
            restrict: 'E',
            templateUrl: 'app/components/listcard/listCard.html',
            scope: {
                list: '=',
                updateName: '&',
                removeMember: '&',
                remindInvite: '&',
                updateInvite: '&',
                removeInvite: '&',
                setActive: '&',
                toggleAdmin: '&',
                removeMe: '&',
                canEdit: '='
            },
            controller: ListCardController,
            controllerAs: 'ctrl',
            bindToController: true
        };

    }

}

export default ListCardDirective;


class ListCardController {

    constructor($log) {
        'ngInject';

        this.canEdit = this.canEdit !== undefined && this.canEdit;
        if (this.canEdit) {
            this.list.invites.push({email: undefined});
        }
    }

    selectMember(member) {
        if (member.key !== undefined) {
            this.selected = member;
            this.selectedType = 'member';
        }
        else {
            delete this.selected;
        }
    }

    selectInvite(invite) {
        if (invite.key !== undefined) {
            this.selected = invite;
            this.selectedType = 'invite';
        }
        else {
            delete this.selected;
        }
    }

    remove() {
        if (this.selectedType === 'member') {
            this.removeMember({list: this.list, member: this.selected});
        }
        else {
            this.removeInvite({list: this.list, invite: this.selected});
        }
    }

}
