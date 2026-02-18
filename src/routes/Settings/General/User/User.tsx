import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from 'stremio/services';
import { SiteAuthContext } from 'stremio/App/withSiteAuth';
import { Link } from '../../components';
import styles from './User.less';

type Props = {
    profile: Profile,
};

const User = ({ profile }: Props) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const { siteLogout, siteAuthEnabled } = useContext(SiteAuthContext);

    const avatar = useMemo(() => (
        !profile.auth ?
            `url('${require('/images/anonymous.png')}')`
            :
            profile.auth.user.avatar ?
                `url('${profile.auth.user.avatar}')`
                :
                `url('${require('/images/default_avatar.png')}')`
    ), [profile.auth]);

    const onLogout = useCallback(() => {
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Logout'
            }
        });
    }, []);

    return (
        <div className={styles['user']}>
            <div className={styles['user-info-content']}>
                <div
                    className={styles['avatar-container']}
                    style={{ backgroundImage: avatar }}
                />
                <div className={styles['email-logout-container']}>
                    <div className={styles['email-label-container']} title={profile.auth === null ? t('ANONYMOUS_USER') : profile.auth.user.email}>
                        <div className={styles['email-label']}>
                            {profile.auth === null ? t('ANONYMOUS_USER') : profile.auth.user.email}
                        </div>
                    </div>
                    {
                        profile.auth !== null ?
                            <Link
                                label={t('LOG_OUT')}
                                onClick={onLogout}
                            />
                            :
                            <Link
                                label={`${t('LOG_IN')} / ${t('SIGN_UP')}`}
                                href={'#/intro'}
                                target={'_self'}
                            />
                    }
                    {
                        siteAuthEnabled ?
                            <Link
                                label={'Site Logout'}
                                onClick={siteLogout}
                            />
                            :
                            null
                    }
                </div>
            </div>
        </div>
    );
};

export default User;
