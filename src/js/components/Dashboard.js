var React = require('react');
var GoalViewer = require('components/GoalViewer');
var ProjectViewer = require('components/ProjectViewer');
var HabitWidget = require('components/HabitWidget');
var ReadWidget = require('components/ReadWidget');
var MiniJournalWidget = require('components/MiniJournalWidget');
var TaskWidget = require('components/TaskWidget');
var FlashCard = require('components/FlashCard');
var AppConstants = require('constants/AppConstants');
var TaskActions = require('actions/TaskActions');
import {findItemById} from 'utils/store-utils';
import {browserHistory} from 'react-router';
var util = require('utils/util');
import {get} from 'lodash';
import {Dialog, IconButton, FontIcon,
    IconMenu, MenuItem} from 'material-ui';

export default class Dashboard extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
            more: null
        };
    }

    componentWillMount() {
        if (!this.props.user) browserHistory.push('/app')
        else {
            document.addEventListener("keydown", this.handle_key_down.bind(this));
            util.set_title(AppConstants.DASHBOARD_PAGE_TITLE);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handle_key_down.bind(this));
    }

    handle_key_down(e) {
        let keyCode = e.keyCode || e.which;
        var tag = e.target.tagName.toLowerCase();
        let in_input = tag == 'input' || tag == 'textarea';
        if (in_input) return true;
        if (keyCode == 84) { // t
            TaskActions.openTaskDialog()
            document.getElementById('TaskWidget').scrollIntoView();
            e.preventDefault();
            return false;
        } else if (keyCode == 72) { // h
            document.getElementById('HabitWidget').scrollIntoView();
            e.preventDefault();
            return false;
        }
    }

    dismiss_more() {
        this.setState({more: null})
    }

    show_more(type) {
        this.setState({more: type});
    }

    flashcards() {
        let {user} = this.props;
        return get(user, 'settings.flashcards', []);
    }

    static_links() {
        let {user} = this.props;
        return get(user, 'settings.links', []);
    }

    render_more() {
        let {more} = this.state;
        let fc = findItemById(this.flashcards(), more, 'id');
        if (fc) return <FlashCard {...fc} />
        return null;
    }

    no_more_menu() {
        return this.flashcards().length == 0 && this.static_links().length == 0;
    }

    goto_page(url) {
        window.open(url, "_blank");
    }

    render() {
        let {more} = this.state;
        let {user} = this.props;
        let journal_qs = [];
        let journal_location = false;
        let journal_notification = false;
        let journal_window_start = AppConstants.JOURNAL_START_HOUR;
        let journal_window_end = AppConstants.JOURNAL_END_HOUR;
        let goal_slots = AppConstants.GOAL_DEFAULT_SLOTS;
        if (user) {
            journal_qs = get(user, 'settings.journals.questions', []);
            journal_location = get(user, 'settings.journals.preferences.location_capture', false);
            journal_notification = get(user, 'settings.journals.preferences.journal_notification', false);
            journal_window_start = parseInt(get(user, 'settings.journals.preferences.journal_start_hour', AppConstants.JOURNAL_START_HOUR));
            journal_window_end = parseInt(get(user, 'settings.journals.preferences.journal_end_hour', AppConstants.JOURNAL_END_HOUR));
            goal_slots = parseInt(get(user, 'settings.goals.preferences.slots', AppConstants.GOAL_DEFAULT_SLOTS));
        } else return <div></div>
        let _more_options = this.flashcards().map((fc) => {
            return <MenuItem key={fc.id} leftIcon={<FontIcon className="material-icons">{fc.icon}</FontIcon>} onClick={this.show_more.bind(this, fc.id)}>{fc.card_title}</MenuItem>
        });
        _more_options = _more_options.concat(this.static_links().map((link) => {
            return <MenuItem key={link.url} leftIcon={<FontIcon className="material-icons">link</FontIcon>} onClick={this.goto_page.bind(this, link.url)}>{link.label}</MenuItem>
        }));
        return (
            <div>

                <TaskWidget ref="taskwidget" user={user} />

                <GoalViewer goal_slots={goal_slots} />

                <ProjectViewer />

                <HabitWidget user={user} />

                <div className="row">
                    <div className="col-sm-6">
                        <ReadWidget />
                    </div>
                    <div className="col-sm-6">
                        <MiniJournalWidget
                           questions={journal_qs}
                           window_start_hr={journal_window_start}
                           window_end_hr={journal_window_end}
                           journal_notification={journal_notification}
                           include_location={journal_location} />
                    </div>
                </div>

                <div className="text-center" style={{marginTop: "20px"}} hidden={this.no_more_menu()}>
                    <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">games</IconButton>}>
                        { _more_options }
                    </IconMenu>
                </div>

                <Dialog open={more != null} onRequestClose={this.dismiss_more.bind(this)} height="800"
                    contentStyle={{
                      minHeight: '600px'
                    }}
                    autoScrollBodyContent={true}>
                    { this.render_more() }
                </Dialog>

            </div>
        );
    }
}
